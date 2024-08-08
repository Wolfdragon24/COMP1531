import { messageSendlaterdm, clear, dmMessages, dmCreate } from '../requestsHelper';
import { register1, register2 } from '../testsHelper';
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
 * - invalid dm id
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

describe('messageSendlaterdm Errors ', () => {
  test('invalid user token', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(user.token + 'ashdg', dm.dmId, 'hi', 99999);
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });

  test('invalid dm id', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(user.token, dm.dmId + 12983, 'hi', 99999);
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message less than 1 character', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(user.token, dm.dmId, '', 99999);
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message more than 1000 characters', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(user.token, dm.dmId, 'a'.repeat(1001), 99999);
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('invalid time sent', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(user.token, dm.dmId, 'hi', 100);
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('user trying to send message in a channel they are not in', () => {
    const userNotInChannel = register2();
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(userNotInChannel.data.token, dm.dmId, 'hello', 99999);
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });
});

describe('messageSendlaterdmlater Success', () => {
  test('successfully sent a message', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSendlaterdm(user.token, dm.dmId, 'hello', Math.floor(Date.now() / 1000) + 4);
    const start = 0;
    const end = -1;
    const expectedMessage: MessageArray = {
      messages: [
        {
          messageId: message.data.messageId,
          uId: user.authUserId,
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
    expect(dmMessages(user.token, dm.dmId, start).data).toStrictEqual({ messages: [], start: start, end: end });

    wait.for.time(5);
    expect(dmMessages(user.token, dm.dmId, start).data).toStrictEqual(expectedMessage);
  });
});
