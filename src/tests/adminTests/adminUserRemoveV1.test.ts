import { register1, register2, channelPublic1 } from '../testsHelper';
import {
  adminUserRemove, adminUserpermissionChange, messageSend, usersAll,
  channelMessages, channelJoin, userProfile, channelDetails, messageSenddm,
  dmCreate, dmMessages, dmDetails, clear
} from '../requestsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Remove Normal User
 * - channelMessages displays messages sent by removed user as 'Removed user'
 * - usersAll doesn't list removed user
 * - userProfile shows the default removed user profile
 * - Remove Global and Channel Owner
 * - channelDetails owner members shows empty array
 *
 * Error Tests
 * - Invalid User Input
 * - Remove Only Global Owner
 * - Token Not Global Owner
 * - Invalid Token
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Remove Normal User', () => {
    const user = register1().data;
    const secondUser = register2().data;
    // Makes channel and sends message
    const channel = channelPublic1(user.token).data;
    channelJoin(secondUser.token, channel.channelId);
    messageSend(user.token, channel.channelId, 'hello');
    messageSend(secondUser.token, channel.channelId, 'hello');

    // Makes dm and sends message
    const dm = dmCreate(user.token, [secondUser.authUserId]).data;

    messageSenddm(user.token, dm.dmId, 'hello');
    messageSenddm(secondUser.token, dm.dmId, 'hello');

    // Removes the user
    const result = adminUserRemove(user.token, secondUser.authUserId);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);

    // Side effects for userProfile
    const removedProfile = {
      user: {
        uId: secondUser.authUserId,
        email: '',
        nameFirst: 'Removed',
        nameLast: 'User',
        handleStr: '',
        profileImgUrl: 'http://compserver.ddns.net:3001/images/removed.jpg'
      }
    };
    expect(userProfile(user.token, secondUser.authUserId).data).toStrictEqual(removedProfile);

    // Side effects for usersAll
    const expectedList = {
      users: [{
        uId: user.authUserId,
        email: 'john@jdoe.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
        profileImgUrl: expect.any(String)
      }]
    };
    expect(usersAll(user.token).data).toStrictEqual(expectedList);

    // Side effects for channel members
    const channelMembers = channelDetails(user.token, channel.channelId).data;
    expect(channelMembers.allMembers).toStrictEqual([{
      uId: user.authUserId,
      email: 'john@jdoe.com',
      nameFirst: 'John',
      nameLast: 'Doe',
      handleStr: 'johndoe',
      profileImgUrl: expect.any(String)
    }]);

    // Side effects for channel messages
    const channelMsgs = channelMessages(user.token, channel.channelId, 0).data;
    expect(channelMsgs.messages[0].message).toStrictEqual('Removed user');
    expect(channelMsgs.messages[0].uId).toStrictEqual(secondUser.authUserId);

    // Side effects for dm members
    const dmMembers = dmDetails(user.token, dm.dmId).data;
    expect(dmMembers.members).toStrictEqual([{
      uId: user.authUserId,
      email: 'john@jdoe.com',
      nameFirst: 'John',
      nameLast: 'Doe',
      handleStr: 'johndoe',
      profileImgUrl: expect.any(String)
    }]);

    // Side effects for dm messages
    const dmMsgs = dmMessages(user.token, dm.dmId, 0).data;
    expect(dmMsgs.messages[0].message).toStrictEqual('Removed user');
    expect(dmMsgs.messages[0].uId).toStrictEqual(secondUser.authUserId);
  });

  test('Remove Global and Channel Owner', () => {
    const user = register1().data;
    const secondUser = register2().data;
    const channel = channelPublic1(secondUser.token).data;
    channelJoin(user.token, channel.channelId);

    adminUserpermissionChange(user.token, secondUser.authUserId, 1);

    const result = adminUserRemove(user.token, secondUser.authUserId);

    const expectedChannelDetails = channelDetails(user.token, channel.channelId).data;

    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(expectedChannelDetails.ownerMembers).toStrictEqual([]);
  });
});

describe('Error Tests', () => {
  test('Invalid User Input', () => {
    const user = register1().data;
    const notAUserId = user.authUserId + 1;

    const result = adminUserRemove(user.token, notAUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Remove Only Global Owner', () => {
    const user = register1().data;

    const result = adminUserRemove(user.token, user.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Token Not Global Owner', () => {
    register1();
    const user = register2().data;

    const result = adminUserRemove(user.token, user.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid Token', () => {
    const user = register1().data;

    const result = adminUserRemove('a', user.authUserId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
