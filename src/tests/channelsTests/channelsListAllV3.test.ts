import { clear, channelsCreate, channelsListAll } from '../requestsHelper';
import { register1, register2, channelPublic1, channelPrivate1 } from '../testsHelper';

// channelsListAllV2 testing:
/**
 * Error Tests
 * - Invalid token
 *
 * Main Tests
 * - No channels
 * - One public channel joined
 * - One private channel joined
 * - One public channel unjoined
 * - One private channel unjoined
 * - Multiple public and private channels
 */

type EmptyChannel = {
  channels: [];
};

beforeEach(() => {
  clear();
});

const AUTH_ERROR = 403;
const SUCCESS_CODE = 200;

describe('Manual Input Tests', () => {
  test('Invalid token', () => {
    const token = 'a';

    const expectedError = {
      message: expect.any(String)
    };
    const result = channelsListAll(token);
    expect(result.data.error).toStrictEqual(expectedError);
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('No channels', () => {
    const token = register1().data.token;

    const expectedChannels: EmptyChannel = {
      channels: []
    };

    const result = channelsListAll(token);
    expect(result.data).toStrictEqual(expectedChannels);
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('One public channel that authUserId is part of', () => {
    const user1 = register1().data;
    const channelId = channelPublic1(user1.token).data.channelId;

    const expectedChannels = {
      channels: [
        {
          channelId: channelId,
          name: 'Channel A',
        }
      ]
    };

    const result = channelsListAll(user1.token);
    expect(result.data).toStrictEqual(expectedChannels);
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('One private channel that authUserId is part of', () => {
    const user1 = register1().data;
    const channelId = channelPrivate1(user1.token).data.channelId;

    const expectedChannels = {
      channels: [
        {
          channelId: channelId,
          name: 'Channel B',
        }
      ]
    };

    const result = channelsListAll(user1.token);
    expect(result.data).toStrictEqual(expectedChannels);
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('One public channel that authUserId is not part of', () => {
    const user1 = register1().data;
    const user2 = register2().data;

    const channelId = channelPublic1(user2.token).data.channelId;

    const expectedChannels = {
      channels: [
        {
          channelId: channelId,
          name: 'Channel A',
        }
      ]
    };

    const result = channelsListAll(user1.token);
    expect(result.data).toStrictEqual(expectedChannels);
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('One private channel that authUserId is not part of', () => {
    const user1 = register1().data;
    const user2 = register2().data;

    const channelId = channelPrivate1(user2.token).data.channelId;

    const expectedChannels = {
      channels: [
        {
          channelId: channelId,
          name: 'Channel B',
        }
      ]
    };

    const result = channelsListAll(user1.token);
    expect(result.data).toStrictEqual(expectedChannels);
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });

  test('Multiple public and private channels', () => {
    const token = register1().data.token;
    const channelId1 = channelsCreate(token, 'test1', true).data.channelId;
    const channelId2 = channelsCreate(token, 'test2', false).data.channelId;
    const channelId3 = channelsCreate(token, 'test3', false).data.channelId;
    const channelId4 = channelsCreate(token, 'test4', true).data.channelId;

    const expectedChannels = {
      channels: [
        {
          channelId: channelId1,
          name: 'test1',
        },
        {
          channelId: channelId2,
          name: 'test2',
        },
        {
          channelId: channelId3,
          name: 'test3',
        },
        {
          channelId: channelId4,
          name: 'test4',
        }
      ]
    };

    const result = channelsListAll(token);
    expect(result.data).toStrictEqual(expectedChannels);
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});
