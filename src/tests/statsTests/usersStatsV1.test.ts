import { register1, register2, channelPublic1, channelPrivate1 } from '../testsHelper';
import { usersStats, messageSend, dmCreate, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Check For correct output structure
 * - Check For Normal Use Stats
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

    const result = usersStats(user.token);
    expect(result.data).toStrictEqual({
      workspaceStats: {
        channelsExist: [{ numChannelsExist: 0, timeStamp: expect.any(Number) }],
        dmsExist: [{ numDmsExist: 0, timeStamp: expect.any(Number) }],
        messagesExist: [{ numMessagesExist: 0, timeStamp: expect.any(Number) }],
        utilizationRate: 0
      }
    });
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('Check Stats For Normal Use', () => {
    const user = register1().data;
    register2();
    const channel = channelPublic1(user.token).data;
    channelPrivate1(user.token);
    const channelCreateTime = Math.floor(Date.now() / 1000);
    dmCreate(user.token, []);
    const dmCreateTime = Math.floor(Date.now() / 1000);

    messageSend(user.token, channel.channelId, 'hello');
    const messageSendTime = Math.floor(Date.now() / 1000);

    const result = usersStats(user.token);
    expect(result.data).toStrictEqual({
      workspaceStats: {
        channelsExist: [
          { numChannelsExist: 0, timeStamp: expect.any(Number) },
          { numChannelsExist: 1, timeStamp: expect.any(Number) },
          { numChannelsExist: 2, timeStamp: expect.any(Number) }
        ],
        dmsExist: [
          { numDmsExist: 0, timeStamp: expect.any(Number) },
          { numDmsExist: 1, timeStamp: expect.any(Number) }
        ],
        messagesExist: [
          { numMessagesExist: 0, timeStamp: expect.any(Number) },
          { numMessagesExist: 1, timeStamp: expect.any(Number) }
        ],
        utilizationRate: 0.5
      }
    });
    expect(result.code).toStrictEqual(SUCCESS_CODE);

    const workspaceData = result.data.workspaceStats;

    expect(workspaceData.channelsExist[0].timeStamp).toBeLessThanOrEqual(channelCreateTime);
    expect(workspaceData.dmsExist[0].timeStamp).toBeLessThanOrEqual(dmCreateTime);
    expect(workspaceData.messagesExist[0].timeStamp).toBeLessThanOrEqual(messageSendTime);
  });
});

describe('Error Tests', () => {
  test('Invalid Token', () => {
    const result = usersStats('a');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
