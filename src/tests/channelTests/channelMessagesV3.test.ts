import { channelMessages, messageSend, clear } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';
/**
 * Main Tests
 * - Display Singular Message
 * - Display 50 Messages
 * - Display 50 Messages and indication for further messages
 * - Display Message with Time Verification
 *
 * Error Tests
 * - channelId does not refer to a valid channel
 * - start greater than the total messages in the channel
 * - channelId is valid but user is not a member of channel
 * - token is invalid
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Display Singular Message', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    const sendMsg = messageSend(userJohn.token, channel.channelId, 'Hello').data;
    const timeSent = Math.floor(Date.now() / 1000) + 2;

    expect(sendMsg).toStrictEqual({ messageId: expect.any(Number) });

    const messages = channelMessages(userJohn.token, channel.channelId, 0).data;

    const expectedObj = {
      messages: [{
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: 'Hello'
      }],
      start: 0,
      end: -1
    };

    expect(messages).toMatchObject(expectedObj);
    expect(messages.messages[0].timeSent).toBeLessThanOrEqual(timeSent);
  });

  test('Display 50 Messages', () => {
    const userJohn = register1().data;
    const messagesList = [];
    const channel = channelPublic1(userJohn.token).data;

    for (let i = 0; i < 50; i++) {
      const text = `Hello ${i}`;
      const sendMsg = messageSend(userJohn.token, channel.channelId, text).data;

      messagesList.unshift({
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: text
      });
    }

    const messages = channelMessages(userJohn.token, channel.channelId, 0).data;

    const expectedObj = {
      start: 0,
      end: -1
    };

    expect(messages).toMatchObject(expectedObj);
    expect(messages.messages).toMatchObject(messagesList);
  });

  test('Display 50 Messages and Indication for Further Messages', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    const messagesList = [];

    for (let i = 0; i < 51; i++) {
      const text = `Hello ${i}`;
      const sendMsg = messageSend(userJohn.token, channel.channelId, text).data;

      if (i !== 0) {
        messagesList.unshift({
          messageId: sendMsg.messageId,
          uId: userJohn.authUserId,
          message: text
        });
      }
    }

    const messages = channelMessages(userJohn.token, channel.channelId, 0).data;

    const expectedObj = {
      start: 0,
      end: 50
    };

    expect(messages).toMatchObject(expectedObj);
    expect(messages.messages).toMatchObject(messagesList);

    const secondMessages = channelMessages(userJohn.token, channel.channelId, 50).data;
    expect(secondMessages.start).not.toStrictEqual(0);
  });

  test('Display Message with Time Verification', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    const timeSent = Math.floor(Date.now() / 1000) + 2;
    const sendMsg = messageSend(userJohn.token, channel.channelId, 'Hello').data;

    const messages = channelMessages(userJohn.token, channel.channelId, 0).data;

    const expectedObj = {
      messages: [{
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: 'Hello'
      }],
      start: 0,
      end: -1
    };

    expect(messages).toMatchObject(expectedObj);
    expect(messages.messages[0].timeSent).toBeLessThanOrEqual(timeSent);
  });
});

describe('Error Tests', () => {
  test('channelId does not refer to a valid channel', () => {
    const userJohn = register1().data;
    const notADmId = 0;

    const messages = channelMessages(userJohn.token, notADmId, 0);

    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
    expect(messages.code).toStrictEqual(400);
  });

  test('start greater than the total messages in the channel', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    messageSend(userJohn.token, channel.channelId, 'Hello');

    const messages = channelMessages(userJohn.token, channel.channelId, 5);

    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
    expect(messages.code).toStrictEqual(400);
  });

  test('channelId is valid but user is not a member of channel', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    const userJane = register2().data;
    messageSend(userJohn.token, channel.channelId, 'Hello');

    const messages = channelMessages(userJane.token, channel.channelId, 0);

    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
    expect(messages.code).toStrictEqual(403);
  });

  test('token is invalid', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    const notAToken = userJohn.token + 'a';

    messageSend(userJohn.token, channel.channelId, 'Hello');

    const messages = channelMessages(notAToken, channel.channelId, 0);

    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
    expect(messages.code).toStrictEqual(403);
  });

  test('Start index is less than 0', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    messageSend(userJohn.token, channel.channelId, 'Hello');

    const messages = channelMessages(userJohn.token, channel.channelId, -1);

    expect(messages.data.error).toStrictEqual({ message: expect.any(String) });
    expect(messages.code).toStrictEqual(400);
  });
});
