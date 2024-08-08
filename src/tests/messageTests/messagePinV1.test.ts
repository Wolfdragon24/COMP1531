import { channelAddowner, channelJoin, clear, dmCreate, messagePin, messageSend, messageSenddm } from '../requestsHelper';
import { channelPublic1, register1, register2 } from '../testsHelper';

/**
 * Main Tests
 * - Pinning own message in channel
 * - Pinning own message in DM
 * - Pinning someone else's message in channel as new owner
 * - Pinning someone else's messages in DM
 *
 * Error Test
 * - Invalid token
 *
 * - messageId does not refer to a valid message in channel
 * - messageId does not refer to a valid message in DM
 *
 * - messageId refers to already pinned message in channel
 * - messageId refers to already pinned message in DM
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
  test('Pinning own message in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    const pinResult = messagePin(user1.token, message.messageId);
    expect(pinResult.code).toStrictEqual(OK_CODE);
    expect(pinResult.data).toStrictEqual({});
  });

  test('Pinning own message in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    const pinResult = messagePin(user1.token, message.messageId);
    expect(pinResult.code).toStrictEqual(OK_CODE);
    expect(pinResult.data).toStrictEqual({});
  });

  test('Pinning someone else\'s message in channel as new owner', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    channelAddowner(user1.token, channel.channelId, user2.authUserId);
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    const pinResult = messagePin(user2.token, message.messageId);
    expect(pinResult.code).toStrictEqual(OK_CODE);
    expect(pinResult.data).toStrictEqual({});
  });

  test('Pinning someone else\'s messages in DM', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    const pinResult = messagePin(user1.token, message.messageId);
    expect(pinResult.code).toStrictEqual(OK_CODE);
    expect(pinResult.data).toStrictEqual({});
  });
});

describe('Error Tests', () => {
  test('messageId does not refer to a valid message in channel', () => {
    const invalidToken = 'a';

    const pinResult = messagePin(invalidToken, 0);
    expect(pinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message in channel', () => {
    const user1 = register1().data;
    channelPublic1(user1.token);

    const pinResult = messagePin(user1.token, 0);
    expect(pinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message in DM', () => {
    const user1 = register1().data;
    dmCreate(user1.token, []);

    const pinResult = messagePin(user1.token, 0);
    expect(pinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to already pinned message in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    messagePin(user1.token, message.messageId);
    const pinResult = messagePin(user1.token, message.messageId);
    expect(pinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to already pinned message in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    messagePin(user1.token, message.messageId);
    const pinResult = messagePin(user1.token, message.messageId);
    expect(pinResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in channel that user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    const pinResult = messagePin(user2.token, message.messageId);
    expect(pinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in DM that user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    const pinResult = messagePin(user2.token, message.messageId);
    expect(pinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in channel that user has no owner permissions in', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    const pinResult = messagePin(user2.token, message.messageId);
    expect(pinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId refers to valid message in DM that user has no owner permissions in', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    const pinResult = messagePin(user2.token, message.messageId);
    expect(pinResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(pinResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});
