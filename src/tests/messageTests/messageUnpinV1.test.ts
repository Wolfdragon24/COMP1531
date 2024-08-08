import { channelJoin, clear, dmCreate, messageUnpin, messageSend, messageSenddm, messagePin, channelAddowner } from '../requestsHelper';
import { channelPublic1, register1, register2 } from '../testsHelper';

/**
 * Main Tests
 * - Unpinning own message in channel
 * - Unpinning own message in DM
 * - Unpinning someone else's message in channel as new owner
 * - Unpinning someone else's pinned message in DM
 *
 * Error Test
 * - Invalid token
 *
 * - messageId does not refer to a valid message in channel
 * - messageId does not refer to a valid message in DM
 *
 * - messageId refers to an unpinned message in channel
 * - messageId refers to an unpinned message in DM
 *
 * - messageId refers to valid message in channel that user is not a member of
 * - messageId refers to valid message in DM that user is not a member of
 *
 * - messageId refers to valid message in channel that user has no owner permissions in
 * - messageId refers to valid message in DM that user has no owner permissions in
 */

const OK_CODE = 200;
const BAD_REQUEST_CODE = 400;
const FORBIDDEN_ACCESS_CODE = 403;

beforeEach(() => {
  clear();
});

describe('Successful Tests', () => {
  test('Unpinning own message in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user1.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(OK_CODE);
    expect(unpinResult.data).toStrictEqual({});
  });

  test('Unpinning own message in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user1.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(OK_CODE);
    expect(unpinResult.data).toStrictEqual({});
  });

  test('Unpinning someone else\'s pinned message in channel as new owner', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    channelAddowner(user1.token, channel.channelId, user2.authUserId);
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user2.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(OK_CODE);
    expect(unpinResult.data).toStrictEqual({});
  });
});

describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';

    const unpinResult = messageUnpin(invalidToken, 0);
    expect(unpinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message in channel', () => {
    const user1 = register1().data;
    channelPublic1(user1.token);

    const unpinResult = messageUnpin(user1.token, 0);
    expect(unpinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message in DM', () => {
    const user1 = register1().data;
    dmCreate(user1.token, []);

    const unpinResult = messageUnpin(user1.token, 0);
    expect(unpinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to an unpinned message in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    const unpinResult = messageUnpin(user1.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to an unpinned message in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    const unpinResult = messageUnpin(user1.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in channel that user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user2.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in DM that user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user2.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in channel that user has no owner permissions in', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user2.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in DM that user has no owner permissions in', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messagePin(user1.token, message.messageId);

    const unpinResult = messageUnpin(user2.token, message.messageId);
    expect(unpinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(unpinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});
