import { channelJoin, clear, dmCreate, messageReact, messageSend, messageSenddm, messageUnreact } from '../requestsHelper';
import { channelPublic1, register1, register2 } from '../testsHelper';

/**
 * Main Tests
 * - Unreacting from own message in channel
 * - Unreacting from own message in DM
 *
 * - Unreacting from someone else's message in channel
 * - Unreacting from someone else's message in DM
 *
 * Error Tests
 * - Invalid token
 *
 * - messageId does not refer to a valid message in channel
 * - messageId does not refer to a valid message in DM
 *
 * - Invalid reactId in channel
 * - Invalid reactId in DM
 *
 * - Message does not contain reactId from user in channel
 * - Message does not contain reactId from user in DM
 */

const OK_CODE = 200;
const BAD_REQUEST_CODE = 400;
const FORBIDDEN_ACCESS_CODE = 403;

beforeEach(() => {
  clear();
});

describe('Successful Tests', () => {
  test('Reacting on own message in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messageReact(user1.token, message.messageId, 1);

    const unreactResult = messageUnreact(user1.token, message.messageId, 1);
    expect(unreactResult.data).toStrictEqual({});
    expect(unreactResult.code).toStrictEqual(OK_CODE);
  });

  test('Reacting on own message in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messageReact(user1.token, message.messageId, 1);

    const unreactResult = messageUnreact(user1.token, message.messageId, 1);
    expect(unreactResult.data).toStrictEqual({});
    expect(unreactResult.code).toStrictEqual(OK_CODE);
  });

  test('Reacting on someone else\'s message in channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messageReact(user2.token, message.messageId, 1);

    const unreactResult = messageUnreact(user2.token, message.messageId, 1);
    expect(unreactResult.data).toStrictEqual({});
    expect(unreactResult.code).toStrictEqual(OK_CODE);
  });

  test('Reacting on someone else\'s message in DM', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messageReact(user2.token, message.messageId, 1);

    const unreactResult = messageUnreact(user2.token, message.messageId, 1);
    expect(unreactResult.data).toStrictEqual({});
    expect(unreactResult.code).toStrictEqual(OK_CODE);
  });
});

describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';

    const unreactResult = messageUnreact(invalidToken, 0, 1);
    expect(unreactResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message in channel', () => {
    const user1 = register1().data;
    channelPublic1(user1.token);

    const unreactResult = messageUnreact(user1.token, 0, 1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('messageId does not refer to a valid message in DM', () => {
    const user1 = register1().data;
    dmCreate(user1.token, []);

    const unreactResult = messageUnreact(user1.token, 0, 1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Invalid reactId in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messageReact(user1.token, message.messageId, 1);

    const unreactResult = messageUnreact(user1.token, message.messageId, -1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Invalid reactId in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messageReact(user1.token, message.messageId, 1);

    const unreactResult = messageUnreact(user1.token, message.messageId, -1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message does not contain reactId from user in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;

    const unreactResult = messageUnreact(user1.token, message.messageId, 1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message does not contain reactId from user in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;

    const unreactResult = messageUnreact(user1.token, message.messageId, 1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message contains reactIds from other users only in channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    const message = messageSend(user1.token, channel.channelId, 'Hello World!').data;
    messageReact(user2.token, message.messageId, 1);

    const unreactResult = messageUnreact(user1.token, message.messageId, 1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Message contains reactIds from other users only in DM', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const message = messageSenddm(user1.token, dm.dmId, 'Hello World!').data;
    messageReact(user2.token, message.messageId, 1);

    const unreactResult = messageUnreact(user1.token, message.messageId, 1);
    expect(unreactResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(unreactResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});
