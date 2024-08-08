import { messageSend, clear, channelMessages } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';
import { Message } from '../../dataStore';

type MessageArray = {
  messages: Message[],
  start: number,
  end: number
}

/**
 * Test list
 * Errors:
 * - invalid token
 * - invalid channel id
 * - user sending a message to a channel they're not a part of
 * - length of message less than 1 character
 * - length of message over 1000 characters
 *
 * Success:
 * - correct return type of messageId
 * - message
 */

beforeEach(() => {
  clear();
});

describe('messageSend Errors ', () => {
  test('invalid user token', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSend(user.data.token + 'ashdg', channel.data.channelId, 'hi');

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });

  test('invalid channel id', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSend(user.data.token, channel.data.channelId + 12983, 'hi');

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message less than 1 character', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSend(user.data.token, channel.data.channelId, '');

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message more than 1000 characters', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSend(user.data.token, channel.data.channelId, 'a'.repeat(1001));

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('user trying to send message in a channel they are not in', () => {
    const userNotInChannel = register2();
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSend(userNotInChannel.data.token, channel.data.channelId, 'hello');

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });
});

describe('messageSend Success', () => {
  test('successfully sent a message', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSend(user.data.token, channel.data.channelId, 'hello');
    const start = 0;
    const end = -1;
    const expectedMessage: MessageArray = {
      messages: [
        {
          messageId: message.data.messageId,
          uId: user.data.authUserId,
          message: 'hello',
          timeSent: expect.any(Number),
          isPinned: false,
          reacts: []
        }
      ],
      start: start,
      end: end
    };

    expect(message.data).toStrictEqual({ messageId: message.data.messageId });
    expect(channelMessages(user.data.token, channel.data.channelId, start).data).toStrictEqual(expectedMessage);
  });
});
