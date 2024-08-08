import { clear, messageSend, channelMessages, messageEdit, userProfile, channelJoin } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

/**
 * Test list:
 * Errors:
 * - invalid token
 * - invalid messageId
 * - length of message over 1000 characters
 * - length of message under 1 character
 * - attempting to edit a message not sent by the authorised user
 *
 * Success:
 * - correct return type of {}
 * - channelMessages shows the edited message
 * - edited message is the same as original
 */

beforeEach(() => {
  clear();
});

describe('messageEditV1 error tests', () => {
  test('invalid token', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;
    const expected = messageEdit(user1.token + '9238d', message1.messageId, 'hello');

    expect(expected.code).toStrictEqual(403);
    expect(expected.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid messageId', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;
    const expected = messageEdit(user1.token, message1.messageId + 12397, 'hello');

    expect(expected.code).toStrictEqual(400);
    expect(expected.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length of message > 1000 characters', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;
    const expected = messageEdit(user1.token, message1.messageId, 'a'.repeat(1001));
    expect(expected.code).toStrictEqual(400);
    expect(expected.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('editing a message not sent by the authorised user', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;
    const expected = messageEdit(user2.token, message1.messageId, 'hello');
    expect(expected.code).toStrictEqual(403);
    expect(expected.data.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('messageEditV1 success tests', () => {
  test('editing message to blank deletes it', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;
    const start = 0;
    const end = -1;

    expect(messageEdit(user1.token, message1.messageId, '').data).toStrictEqual({});
    expect(channelMessages(user1.token, channel1.channelId, start).data).toStrictEqual(
      {
        messages: [],
        start: start,
        end: end
      }
    );
  });

  test('no change to edited message', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;

    const expected = messageEdit(user1.token, message1.messageId, 'hi').data;

    expect(expected).toStrictEqual({});
  });

  test('Successful edit', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel1.channelId);
    const message1 = messageSend(user1.token, channel1.channelId, 'hi').data;
    const message2 = messageSend(user2.token, channel1.channelId, 'hello').data;
    const start = 0;
    const end = -1;

    const user1Details = userProfile(user1.token, user1.authUserId).data.user;
    expect(messageEdit(user1.token, message1.messageId, 'hello').data).toStrictEqual({});
    expect(messageEdit(user2.token, message2.messageId, `hello @${user1Details.handleStr}`).data).toStrictEqual({});
    expect(channelMessages(user1.token, channel1.channelId, start).data).toStrictEqual(
      {
        messages: [
          {
            messageId: message2.messageId,
            uId: user2.authUserId,
            message: `hello @${user1Details.handleStr}`,
            timeSent: expect.any(Number),
            isPinned: false,
            reacts: []
          },
          {
            messageId: message1.messageId,
            uId: user1.authUserId,
            message: 'hello',
            timeSent: expect.any(Number),
            isPinned: false,
            reacts: []
          }
        ],
        start: start,
        end: end
      }
    );
  });
});
