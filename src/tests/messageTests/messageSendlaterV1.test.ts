import { messageSendlater, clear, channelMessages } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';
import { Message } from '../../dataStore';
const wait = require('wait-for-stuff');

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
 * - timeSent is in the past
 *
 * Success:
 * - correct return type of messageId
 * - message
 */

jest.setTimeout(10000);

beforeEach(() => {
  clear();
});

describe('messageSendlater Errors ', () => {
  test('invalid user token', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(user.data.token + 'ashdg', channel.data.channelId, 'hi', 99999);

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });

  test('invalid channel id', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(user.data.token, channel.data.channelId + 12983, 'hi', 99999);

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message less than 1 character', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(user.data.token, channel.data.channelId, '', 99999);

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message more than 1000 characters', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(user.data.token, channel.data.channelId, 'a'.repeat(1001), 99999);

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('invalid time sent', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(user.data.token, channel.data.channelId, 'hi', 100);

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('user trying to send message in a channel they are not in', () => {
    const userNotInChannel = register2();
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(userNotInChannel.data.token, channel.data.channelId, 'hello', 99999);

    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });
});

describe('messageSendlaterlater Success', () => {
  test('successfully sent a message', () => {
    const user = register1();
    const channel = channelPublic1(user.data.token);
    const message = messageSendlater(user.data.token, channel.data.channelId, 'hello', Math.floor(Date.now() / 1000) + 4);
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
    expect(channelMessages(user.data.token, channel.data.channelId, start).data).toStrictEqual({ messages: [], start: start, end: end });

    wait.for.time(5);
    expect(channelMessages(user.data.token, channel.data.channelId, start).data).toStrictEqual(expectedMessage);
  });
});
