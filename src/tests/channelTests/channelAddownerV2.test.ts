import { clear, channelAddowner, channelDetails, channelJoin, authRegister } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successfully makes someone an owner of the channel
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid channel id [400]
 * - Invalid user id [400]
 * - uId refers to a someone who is not a member of the channel [400]
 * - uId is someone already owner of the channel [400]
 * - The user does not have owner permissions of the channel [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Successfully adds owner', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    channelJoin(user2.token, channelId);

    const owner = channelAddowner(user1.token, channelId, user2.authUserId);

    const details = {
      name: 'Channel A',
      isPublic: true,
      ownerMembers: [{
        uId: user1.authUserId,
        email: 'john@jdoe.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
        profileImgUrl: expect.any(String)
      },
      {
        uId: user2.authUserId,
        email: 'jane@jdoe.com',
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: 'janedoe',
        profileImgUrl: expect.any(String)
      }],
      allMembers: [{
        uId: user1.authUserId,
        email: 'john@jdoe.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
        profileImgUrl: expect.any(String)
      },
      {
        uId: user2.authUserId,
        email: 'jane@jdoe.com',
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: 'janedoe',
        profileImgUrl: expect.any(String)
      }]
    };

    expect(owner.data).toStrictEqual({});
    expect(owner.code).toStrictEqual(SUCCESS_CODE);
    expect(channelDetails(user1.token, channel.channelId).data).toStrictEqual(details);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const result = channelAddowner(invalidToken, 1, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid channel id', () => {
    const user = register1().data;
    const channelId = 91234567890;
    const result = channelAddowner(user.token, channelId, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid user id', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const userId = user.authUserId + 123456;
    const result = channelAddowner(user.token, channel.channelId, userId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('uId is not a member of the channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const user3 = authRegister('john@gmail.com', 'password', 'John', 'Day').data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    const result = channelAddowner(user3.token, channelId, user2.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User is already an owner', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    channelJoin(user2.token, channelId);
    channelAddowner(user1.token, channelId, user2.authUserId);
    const result = channelAddowner(user2.token, channelId, user1.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Auth user doesn\'t have owner permissions', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const user3 = authRegister('john@gmail.com', 'password', 'John', 'Day').data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    channelJoin(user2.token, channelId);
    channelJoin(user3.token, channelId);
    const result = channelAddowner(user2.token, channelId, user3.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
