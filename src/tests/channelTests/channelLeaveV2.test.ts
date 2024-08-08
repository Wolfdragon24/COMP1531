import {
  clear, channelLeave, standupStart, // eslint-disable-line no-unused-vars
  messageSend, channelMessages, channelJoin, channelDetails
} from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successful leave by the last member of a channel
 * - Messages by the leaving user still exist
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid channel id [400]
 * - The user is a starter of an active standup [400]
 * - The user is not a member of the channel [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Last channel member user successfully leaves a channel', () => {
    const user = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user.token).data;
    const message = messageSend(user.token, channel.channelId, 'hello!').data;
    const timeSent = Math.floor(Date.now() / 1000) + 2;
    const leave = channelLeave(user.token, channel.channelId);

    const details = {
      name: 'Channel A',
      isPublic: true,
      ownerMembers: [] as Array<object>,
      allMembers: [{
        uId: user2.authUserId,
        email: 'jane@jdoe.com',
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: 'janedoe',
        profileImgUrl: expect.any(String)
      }]
    };

    const messages = {
      messages: [
        {
          messageId: message.messageId,
          uId: user.authUserId,
          message: 'hello!'
        }
      ],
      start: 0,
      end: -1
    };

    channelJoin(user2.token, channel.channelId);
    expect(leave.data).toStrictEqual({});
    expect(leave.code).toStrictEqual(SUCCESS_CODE);
    const result = channelMessages(user2.token, channel.channelId, 0).data;
    expect(channelDetails(user2.token, channel.channelId).data).toStrictEqual(details);
    expect(result).toMatchObject(messages);
    expect(result.messages[0].timeSent).toBeLessThanOrEqual(timeSent);
  });
  test('Channel member leaves during an active standup they did not start', () => {
    const user = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user.token).data;
    channelJoin(user2.token, channel.channelId);
    standupStart(user2.token, channel.channelId, 1);

    const details = {
      name: 'Channel A',
      isPublic: true,
      ownerMembers: [] as Array<object>,
      allMembers: [{
        uId: user2.authUserId,
        email: 'jane@jdoe.com',
        nameFirst: 'Jane',
        nameLast: 'Doe',
        handleStr: 'janedoe',
        profileImgUrl: expect.any(String)
      }]
    };
    const leave = channelLeave(user.token, channel.channelId);

    expect(leave.data).toStrictEqual({});
    expect(leave.code).toStrictEqual(SUCCESS_CODE);
    expect(channelDetails(user2.token, channel.channelId).data).toStrictEqual(details);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const result = channelLeave(invalidToken, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid channel id', () => {
    const user = register1().data;
    const channelId = 91234567890;
    const result = channelLeave(user.token, channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User is a starter of an active standup', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const channelId = channel.channelId;
    standupStart(user.token, channelId, 1);
    const result = channelLeave(user.token, channelId);
    expect(result.code).toStrictEqual(REQUEST_ERROR);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('User is not a member of the channel', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    const channelId = channel.channelId;
    const result = channelLeave(user2.token, channelId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
