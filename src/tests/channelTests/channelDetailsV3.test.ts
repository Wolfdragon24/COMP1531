import { clear, channelJoin, channelDetails } from '../requestsHelper';
import { register1, register2, channelPublic1, channelPrivate1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Details of a public channel with one user
 * - Details of a private channel with one user
 * - Details of a channel with multiple users
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid channelId [400]
 * - User is not a member of the channel [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Details of a public channel with one user', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;

    const expectedOutput = {
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
      }]
    };

    const details = channelDetails(user1.token, channel.channelId);

    expect(details.data).toMatchObject(expectedOutput);
    expect(details.code).toStrictEqual(SUCCESS_CODE);
  });

  test('Details of a private channel with one user', () => {
    const user1 = register1().data;
    const channel = channelPrivate1(user1.token).data;

    const expectedOutput = {
      name: 'Channel B',
      isPublic: false,
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
      }]
    };

    const details = channelDetails(user1.token, channel.channelId);

    expect(details.data).toMatchObject(expectedOutput);
    expect(details.code).toStrictEqual(SUCCESS_CODE);
  });

  test('Details of a channel with multiple users', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);

    const expectedOutput = {
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

    const details = channelDetails(user1.token, channel.channelId);

    expect(details.data).toMatchObject(expectedOutput);
    expect(details.code).toStrictEqual(SUCCESS_CODE);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const result = channelDetails(invalidToken, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid channel id', () => {
    const user = register1().data;
    const channelId = 91234567890;
    const result = channelDetails(user.token, channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User is not a member of the channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const result = channelDetails(user2.token, channel.channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
