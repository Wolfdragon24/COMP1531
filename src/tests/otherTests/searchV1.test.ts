import { Message } from '../../dataStore';
import { search, messageSenddm, messageSend, dmCreate, clear } from '../requestsHelper';
import { register1, channelPublic1, channelPrivate1 } from '../testsHelper';

/**
 * Success cases
 * - found message in dm
 * - found message in private channel
 * - found message in public channel
 * - found message across all three channels
 * - no matches
 *
 * Error cases
 * - querystr > 1000 chars
 * - querystr < 0 chars
 * - token invalid
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Found messages in DM', () => {
    const userJohn = register1().data;
    const dm = dmCreate(userJohn.token, []).data;
    const sendMsg = messageSenddm(userJohn.token, dm.dmId, 'HelLo').data;
    const expectedObj = {
      messages: [{
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: 'HelLo',
      }]
    };

    const result = search(userJohn.token, 'hello');
    expect(result.code).toStrictEqual(200);
    expect(result.data).toMatchObject(expectedObj);
  });

  test('Found messages in private channel', () => {
    const userJohn = register1().data;
    const channel = channelPrivate1(userJohn.token).data;
    const sendMsg = messageSend(userJohn.token, channel.channelId, 'HelLo').data;
    const expectedObj = {
      messages: [{
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: 'HelLo',
      }]
    };

    const result = search(userJohn.token, 'hello');
    expect(result.code).toStrictEqual(200);
    expect(result.data).toMatchObject(expectedObj);
  });

  test('Found messages in public channel', () => {
    const userJohn = register1().data;
    const channel = channelPublic1(userJohn.token).data;
    const sendMsg = messageSend(userJohn.token, channel.channelId, 'HelLo').data;
    const expectedObj = {
      messages: [{
        messageId: sendMsg.messageId,
        uId: userJohn.authUserId,
        message: 'HelLo',
      }]
    };

    const result = search(userJohn.token, 'hello');
    expect(result.code).toStrictEqual(200);
    expect(result.data).toMatchObject(expectedObj);
  });

  test('Found messages in dms and channels ', () => {
    const userJohn = register1().data;
    const dm = dmCreate(userJohn.token, []).data;
    const sendMsgdm = messageSenddm(userJohn.token, dm.dmId, 'HelLo1').data;
    let channel = channelPublic1(userJohn.token).data;
    const sendMsgpub = messageSend(userJohn.token, channel.channelId, 'HelLo2').data;
    channel = channelPrivate1(userJohn.token).data;
    const sendMsgpriv = messageSend(userJohn.token, channel.channelId, 'HelLo3').data;
    const expectedObj = {
      messages: [{
        messageId: sendMsgdm.messageId,
        uId: userJohn.authUserId,
        message: 'HelLo1',
      },
      {
        messageId: sendMsgpub.messageId,
        uId: userJohn.authUserId,
        message: 'HelLo2',
      },
      {
        messageId: sendMsgpriv.messageId,
        uId: userJohn.authUserId,
        message: 'HelLo3',
      }]
    };

    const result = search(userJohn.token, 'hello');
    expect(result.code).toStrictEqual(200);
    const resultSet = new Set(result.data.messages.map((message: Message) => {
      return {
        messageId: message.messageId,
        uId: message.uId,
        message: message.message
      };
    }));
    expect(resultSet).toStrictEqual(new Set(expectedObj.messages));
  });

  test('No matches found', () => {
    const userJohn = register1().data;
    const result = search(userJohn.token, 'hello');

    expect(result.code).toStrictEqual(200);
    expect(result.data).toMatchObject({ messages: [] });
  });
});

describe('Error Tests', () => {
  test('Invalid Token', () => {
    const userJohn = register1().data;
    const notAToken = userJohn.token + 'a';
    const result = search(notAToken, 'hello');

    expect(result.code).toStrictEqual(403);
    expect(result.data.error).toMatchObject({ message: expect.any(String) });
  });

  test('Query string is empty', () => {
    const userJohn = register1().data;
    const result = search(userJohn.token, '');

    expect(result.code).toStrictEqual(400);
    expect(result.data.error).toMatchObject({ message: expect.any(String) });
  });

  test('Query string over 1000 chars', () => {
    const userJohn = register1().data;
    const result = search(userJohn.token, 'a'.repeat(1001));

    expect(result.code).toStrictEqual(400);
    expect(result.data.error).toMatchObject({ message: expect.any(String) });
  });

  test('Invalid Token', () => {
    const userJohn = register1().data;
    const result = search(userJohn.token + 'ashdg', '');

    expect(result.code).toStrictEqual(403);
    expect(result.data.error).toMatchObject({ message: expect.any(String) });
  });
});
