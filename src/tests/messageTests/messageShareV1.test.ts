import { channelJoin, clear, dmCreate, messageSend, messageSenddm, messageShare } from '../requestsHelper';
import { channelPublic1, channelPublic2, register1, register2 } from '../testsHelper';

/**
 * Main Tests
 * - Share someone else's message from channel to other channel
 * - Share someone else's message from channel to other DM
 * - Share someone else's message from DM to other channel
 * - Share someone else's message from DM to other DM
 *
 * Error Tests
 * - Invalid token
 *
 * - Both channelId and dmId are invalid
 * - Neither channelId nor dmId is -1
 *
 * - ogMessageId does not refer to valid message in channel
 * - ogMessageId does not refer to valid message in DM
 *
 * - Length of optional message is long than 1000 characters
 *
 * - Valid share request except user is not a member of the channel
 * - Valid share request except user is not a member of the DM
 */

const OK_CODE = 200;
const BAD_REQUEST_CODE = 400;
const FORBIDDEN_ACCESS_CODE = 403;

beforeEach(() => {
  clear();
});

describe('Successful Tests', () => {
  test('Share someone else\'s message from channel to other channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    const channel2 = channelPublic2(user2.token).data;
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;
    channelJoin(user2.token, channel1.channelId);

    const shareResult = messageShare(user2.token, message.messageId, 'Never gonna give you up', channel2.channelId, -1);
    expect(shareResult.code).toStrictEqual(OK_CODE);
    expect(shareResult.data).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });

  test('Share someone else\'s message from channel to other DM', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel1.channelId);
    const dm2 = dmCreate(user2.token, []).data;
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    const shareResult = messageShare(user2.token, message.messageId, 'Never gonna let you down', -1, dm2.dmId);
    expect(shareResult.code).toStrictEqual(OK_CODE);
    expect(shareResult.data).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });

  test('Share someone else\'s message from DM to other channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm1 = dmCreate(user1.token, [user2.authUserId]).data;
    const channel2 = channelPublic2(user2.token).data;
    const message = messageSenddm(user1.token, dm1.dmId, 'Hello World!').data;

    const shareResult = messageShare(user2.token, message.messageId, 'Never gonna run around', channel2.channelId, -1);
    expect(shareResult.code).toStrictEqual(OK_CODE);
    expect(shareResult.data).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });

  test('Share someone else\'s message from DM to other DM', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const dm1 = dmCreate(user1.token, [user2.authUserId]).data;
    const dm2 = dmCreate(user2.token, []).data;
    const message = messageSenddm(user1.token, dm1.dmId, 'Hello World!').data;

    const shareResult = messageShare(user2.token, message.messageId, 'And desert you', -1, dm2.dmId);
    expect(shareResult.code).toStrictEqual(OK_CODE);
    expect(shareResult.data).toStrictEqual({ sharedMessageId: expect.any(Number) });
  });
});

describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const channel2 = channelPublic2(user1.token).data;
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    const shareResult = messageShare(invalidToken, message.messageId, '', channel2.channelId, -1);
    expect(shareResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Both channelId and dmId are invalid', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const channel2 = channelPublic2(user1.token).data;
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    const shareResult = messageShare(user1.token, message.messageId, '', channel2.channelId + 1, 0);
    expect(shareResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Neither channelId nor dmId is - 1', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const channel2 = channelPublic2(user1.token).data;
    const dm = dmCreate(user1.token, []).data;
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    const shareResult = messageShare(user1.token, message.messageId, '', channel2.channelId, dm.dmId);
    expect(shareResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('ogMessageId does not refer to valid message in channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;

    const shareResult = messageShare(user1.token, 0, '', channel.channelId, -1);
    expect(shareResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('ogMessageId does not refer to valid message in DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;

    const shareResult = messageShare(user1.token, 0, '', -1, dm.dmId);
    expect(shareResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Length of optional message is long than 1000 characters', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const channel2 = channelPublic2(user1.token).data;
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    let optionalMessage = '';
    for (let i = 0; i < 1001; i++) {
      optionalMessage = optionalMessage.concat('a');
    }
    const shareResult = messageShare(user1.token, message.messageId, optionalMessage, channel2.channelId, -1);
    expect(shareResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Valid share request except user is not a member of the channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    const channel2 = channelPublic2(user1.token).data;
    channelJoin(user2.token, channel1.channelId);
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    const shareResult = messageShare(user2.token, message.messageId, '', channel2.channelId, -1);
    expect(shareResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Valid share request except user is not a member of the DM', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    const dm = dmCreate(user1.token, []).data;
    channelJoin(user2.token, channel1.channelId);
    const message = messageSend(user1.token, channel1.channelId, 'Hello World!').data;

    const shareResult = messageShare(user2.token, message.messageId, '', -1, dm.dmId);
    expect(shareResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(shareResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});
