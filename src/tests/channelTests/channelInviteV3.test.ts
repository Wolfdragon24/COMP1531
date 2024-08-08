import { clear, channelInvite, channelsList } from '../requestsHelper';
import { register1, register2, register3, channelPublic1, channelPrivate1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - User gets invited to a public channel
 * - User gets invited to a private channel
 *
 * Error tests:
 * - Invalid token [400]
 * - Invalid channelId [400]
 * - Invalid user id [400]
 * - User already member of the channel [400]
 * - The user inviting is not in the channel [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('User gets invited to a public channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;

    const invite = channelInvite(user1.token, channel.channelId, user2.authUserId);
    const expectedChannels = {
      channels: [{
        channelId: channel.channelId,
        name: 'Channel A'
      }]
    };

    expect(invite.data).toStrictEqual({});
    expect(invite.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsList(user2.token).data).toStrictEqual(expectedChannels);
  });

  test('User gets invited to a private channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPrivate1(user2.token).data;

    const invite = channelInvite(user2.token, channel.channelId, user1.authUserId);
    const expectedChannels = {
      channels: [{
        channelId: channel.channelId,
        name: 'Channel B'
      }]
    };

    expect(invite.data).toStrictEqual({});
    expect(invite.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsList(user2.token).data).toStrictEqual(expectedChannels);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const result = channelInvite(invalidToken, 1, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid channel id', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channelId = 91234567890;
    const result = channelInvite(user1.token, channelId, user2.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid channel id', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const userId = 91234567890;
    const result = channelInvite(user1.token, channel.channelId, userId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User already member of the channel', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const channelId = channel.channelId;
    const result = channelInvite(user.token, channelId, user.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User inviting is not in the channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const user3 = register3().data;

    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;

    const result = channelInvite(user2.token, channelId, user3.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
