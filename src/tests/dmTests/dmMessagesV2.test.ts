import { dmMessages, messageSenddm, dmCreate, clear } from '../requestsHelper';
import { register1, register2 } from '../testsHelper';
/**
 * Main Tests
 * - Display Singular Message
 * - Display 50 Messages
 * - Display 50 Messages and indication for further messages
 * - Display Message with Time Verification
 *
 * Error Tests
 * - dmId does not refer to a valid DM
 * - start greater than the total messages in the channel
 * - dmId is valid but user is not a member of DM
 * - token is invalid
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Display Singular Message', () => {
    const userJohn = register1().data;

    const dm = dmCreate(userJohn.token, []).data;

    const sendMsg = messageSenddm(userJohn.token, dm.dmId, 'Hello').data;
    const timeSent = Math.floor(Date.now() / 1000) + 2;

    expect(sendMsg).toStrictEqual({ messageId: expect.any(Number) });

    const messages = dmMessages(userJohn.token, dm.dmId, 0);

    const expectedObj = {
      messages: [{
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: 'Hello',
      }],
      start: 0,
      end: -1
    };
    expect(messages.code).toStrictEqual(200);
    expect(messages.data).toMatchObject(expectedObj);
    expect(messages.data.messages[0].timeSent).toBeLessThanOrEqual(timeSent);
  });

  test('Display 50 Messages', () => {
    const userJohn = register1().data;
    const messagesList = [];

    const dm = dmCreate(userJohn.token, []).data;

    for (let i = 0; i < 50; i++) {
      const text = `Hello ${i}`;
      const sendMsg = messageSenddm(userJohn.token, dm.dmId, text).data;

      messagesList.unshift({
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: text,
      });
    }

    const messages = dmMessages(userJohn.token, dm.dmId, 0);

    const expectedObj = {
      messages: messagesList,
      start: 0,
      end: -1
    };

    expect(messages.code).toStrictEqual(200);
    expect(messages.data).toMatchObject(expectedObj);
    expect(messages.data.messages).toMatchObject(messagesList);
  });

  test('Display 50 Messages and Indication for Further Messages', () => {
    const userJohn = register1().data;
    const messagesList = [];

    const dm = dmCreate(userJohn.token, []).data;

    for (let i = 0; i < 51; i++) {
      const text = `Hello ${i}`;
      const sendMsg = messageSenddm(userJohn.token, dm.dmId, text).data;

      if (i !== 0) {
        messagesList.unshift({
          messageId: sendMsg.messageId,
          uId: userJohn.authUserId,
          message: text,
        });
      }
    }

    const messages = dmMessages(userJohn.token, dm.dmId, 0);

    const expectedObj = {
      start: 0,
      end: 50
    };

    expect(messages.code).toStrictEqual(200);
    expect(messages.data).toMatchObject(expectedObj);
    expect(messages.data.messages).toMatchObject(messagesList);
  });
});

describe('Error Tests', () => {
  test('dmId does not refer to a valid DM', () => {
    const userJohn = register1().data;
    const notADmId = 0;

    const messages = dmMessages(userJohn.token, notADmId, 0);
    expect(messages.code).toStrictEqual(400);
    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('start greater than the total messages in the channel', () => {
    const userJohn = register1().data;

    const dm = dmCreate(userJohn.token, []).data;

    messageSenddm(userJohn.token, dm.dmId, 'Hello');

    const messages = dmMessages(userJohn.token, dm.dmId, 5);
    expect(messages.code).toStrictEqual(400);
    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('dmId is valid but user is not a member of DM', () => {
    const userJohn = register1().data;
    const userJane = register2().data;

    const dm = dmCreate(userJohn.token, []).data;

    messageSenddm(userJohn.token, dm.dmId, 'Hello');

    const messages = dmMessages(userJane.token, dm.dmId, 0);
    expect(messages.code).toStrictEqual(403);
    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('token is invalid', () => {
    const userJohn = register1().data;
    const notAToken = userJohn.token + 'a';

    const dm = dmCreate(userJohn.token, []).data;

    messageSenddm(userJohn.token, dm.dmId, 'Hello');

    const messages = dmMessages(notAToken, dm.dmId, 0);
    expect(messages.code).toStrictEqual(403);
    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Start index is less than 0', () => {
    const userJohn = register1().data;

    const dm = dmCreate(userJohn.token, []).data;

    messageSenddm(userJohn.token, dm.dmId, 'Hello');
    const messages = dmMessages(userJohn.token, dm.dmId, -1);

    expect(messages.code).toStrictEqual(400);
    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
  });
});
