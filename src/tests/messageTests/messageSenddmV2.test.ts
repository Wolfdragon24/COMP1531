import { clear, dmCreate, dmMessages, messageSenddm } from '../requestsHelper';
import { register1, register2 } from '../testsHelper';
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

describe('messageSenddm Errors ', () => {
  test('invalid user token', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSenddm(user.token + 'ashdg', dm.dmId, 'hi');
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });

  test('invalid dm id', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSenddm(user.token, dm.dmId + 12983, 'hi');
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message less than 1 character', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSenddm(user.token, dm.dmId, '');
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('length of message more than 1000 characters', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSenddm(user.token, dm.dmId, 'a'.repeat(1001));
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(400);
  });

  test('user trying to send message in a channel they are not in', () => {
    const userNotInChannel = register2();
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSenddm(userNotInChannel.data.token, dm.dmId, 'hello');
    expect(message.data.error).toStrictEqual({ message: expect.any(String) });
    expect(message.code).toStrictEqual(403);
  });
});

describe('messageSend Success', () => {
  test('successfully sent a message', () => {
    const user = register1().data;
    const dm = dmCreate(user.token, []).data;
    const message = messageSenddm(user.token, dm.dmId, 'hello').data;
    const start = 0;
    const end = -1;
    const expectedMessage: MessageArray = {
      messages: [
        {
          messageId: message.messageId,
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

    expect(message).toStrictEqual({ messageId: message.messageId });
    expect(dmMessages(user.token, dm.dmId, start).data).toStrictEqual(expectedMessage);
  });
});
