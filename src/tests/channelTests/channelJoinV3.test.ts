import { clear, channelJoin, channelsList } from '../requestsHelper';
import { register1, register2, channelPublic1, channelPrivate1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Normal user successfully joins a public channel
 * - Global owner successfully joins a private channel
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid channelId [400]
 * - User already member of the channel [400]
 * - User attempting to join a private channel they have no permissions to [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Normal user successfully joins a public channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;

    const join = channelJoin(user2.token, channel.channelId);
    const expectedChannels = {
      channels: [{
        channelId: channel.channelId,
        name: 'Channel A'
      }]
    };

    expect(join.data).toStrictEqual({});
    expect(join.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsList(user2.token).data).toStrictEqual(expectedChannels);
  });

  test('Global owner successfully joins a private channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPrivate1(user2.token).data;

    const join = channelJoin(user1.token, channel.channelId);
    const expectedChannels = {
      channels: [{
        channelId: channel.channelId,
        name: 'Channel B'
      }]
    };

    expect(join.data).toStrictEqual({});
    expect(join.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsList(user1.token).data).toStrictEqual(expectedChannels);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const result = channelJoin(invalidToken, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid channel id', () => {
    const user = register1().data;
    const channelId = 91234567890;
    const result = channelJoin(user.token, channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User already member of the channel', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const channelId = channel.channelId;
    const result = channelJoin(user.token, channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User attempting to join', () => {
    const user = register1().data;
    const user2 = register2().data;
    const channel = channelPrivate1(user.token).data;
    const channelId = channel.channelId;
    const result = channelJoin(user2.token, channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
