import { register1, register2, channelPublic1, channelPrivate1 } from '../testsHelper';
import { userStats, messageSend, dmCreate, messageRemove, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Check For correct output structure
 * - Check For Normal Use Stats
 * - Involvement rate is greater than 1
 *
 * Error Tests
 * - Invalid Token
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Check For Correct Output Structure', () => {
    const user = register1().data;

    const result = userStats(user.token);

    expect(result.data).toStrictEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) }],
        involvementRate: 0
      }
    });
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('Check Stats For Normal Use', () => {
    const user = register1().data;
    const secondUser = register2().data;
    const channel = channelPublic1(user.token).data;
    channelPrivate1(user.token);
    const channelCreateTime = Math.floor(Date.now() / 1000) + 2;
    dmCreate(user.token, [secondUser.authUserId]);
    const dmJoinTime = Math.floor(Date.now() / 1000) + 2;

    messageSend(user.token, channel.channelId, 'hello');
    const messageSendTime = Math.floor(Date.now() / 1000) + 2;

    const result = userStats(user.token);
    expect(result.data).toStrictEqual({
      userStats: {
        channelsJoined: [
          { numChannelsJoined: 0, timeStamp: expect.any(Number) },
          { numChannelsJoined: 1, timeStamp: expect.any(Number) },
          { numChannelsJoined: 2, timeStamp: expect.any(Number) }
        ],
        dmsJoined: [
          { numDmsJoined: 0, timeStamp: expect.any(Number) },
          { numDmsJoined: 1, timeStamp: expect.any(Number) }
        ],
        messagesSent: [
          { numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) }
        ],
        involvementRate: 1
      }
    });
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(result.data.userStats.dmsJoined[0].timeStamp).toBeLessThanOrEqual(dmJoinTime);
    expect(result.data.userStats.messagesSent[0].timeStamp).toBeLessThanOrEqual(messageSendTime);
    expect(result.data.userStats.channelsJoined[0].timeStamp).toBeLessThanOrEqual(channelCreateTime);
  });

  test('Involvement rate greater than 1', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;

    const message1 = messageSend(user.token, channel.channelId, 'hello').data;
    const message2 = messageSend(user.token, channel.channelId, 'hello').data;
    const message3 = messageSend(user.token, channel.channelId, 'hello').data;

    messageRemove(user.token, message1.messageId);
    messageRemove(user.token, message2.messageId);
    messageRemove(user.token, message3.messageId);

    const result = userStats(user.token);

    expect(result.data).toStrictEqual({
      userStats: {
        channelsJoined: [{ numChannelsJoined: 0, timeStamp: expect.any(Number) }, { numChannelsJoined: 1, timeStamp: expect.any(Number) }],
        dmsJoined: [{ numDmsJoined: 0, timeStamp: expect.any(Number) }],
        messagesSent: [{ numMessagesSent: 0, timeStamp: expect.any(Number) },
          { numMessagesSent: 1, timeStamp: expect.any(Number) },
          { numMessagesSent: 2, timeStamp: expect.any(Number) },
          { numMessagesSent: 3, timeStamp: expect.any(Number) }],
        involvementRate: 1
      }
    });
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error Tests', () => {
  test('Invalid Token', () => {
    const result = userStats('a');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
