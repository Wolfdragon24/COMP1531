import { clear, channelAddowner, channelRemoveowner, channelDetails, channelJoin, authRegister } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successfully removes someone as an owner of the channel
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid channel id [400]
 * - Invalid user id [400]
 * - uId refers to someone who is not an owner of the channel [400]
 * - uId refers to someone who is the only owner of the channel [400]
 * - The user does not have owner permissions of the channel [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Successfully removes owner', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    channelJoin(user2.token, channelId);
    channelAddowner(user1.token, channelId, user2.authUserId);
    const remove = channelRemoveowner(user1.token, channelId, user2.authUserId);

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

    expect(remove.data).toStrictEqual({});
    expect(remove.code).toStrictEqual(SUCCESS_CODE);
    expect(channelDetails(user1.token, channel.channelId).data).toStrictEqual(details);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const result = channelRemoveowner(invalidToken, 1, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid channel id', () => {
    const user = register1().data;
    const channelId = 91234567890;
    const result = channelRemoveowner(user.token, channelId, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid user id', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const userId = user.authUserId + 123456;

    expect(channelRemoveowner(user.token, channel.channelId, userId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(channelRemoveowner(user.token, channel.channelId, userId).code).toStrictEqual(REQUEST_ERROR);
  });

  test('uId is not an owner of the channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;

    expect(channelRemoveowner(user1.token, channelId, user2.authUserId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(channelRemoveowner(user1.token, channelId, user2.authUserId).code).toStrictEqual(REQUEST_ERROR);
  });

  test('User is the only owner', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const channelId = channel.channelId;

    expect(channelRemoveowner(user.token, channelId, user.authUserId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(channelRemoveowner(user.token, channelId, user.authUserId).code).toStrictEqual(REQUEST_ERROR);
  });

  test('Auth user doesn\'t have owner permissions', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const user3 = authRegister('john@gmail.com', 'password', 'John', 'Day').data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    channelJoin(user2.token, channelId);
    channelAddowner(user1.token, channelId, user2.authUserId);
    channelJoin(user3.token, channelId);
    expect(channelRemoveowner(user3.token, channelId, user1.authUserId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(channelRemoveowner(user3.token, channelId, user1.authUserId).code).toStrictEqual(AUTH_ERROR);
  });
});
