import { clear, channelsList, channelJoin, channelInvite, channelsCreate } from '../requestsHelper';
import { register1, register2, channelPrivate1, channelPublic1 } from '../testsHelper';

type EmptyChannels = {
  channels: []
};

const AUTH_ERROR = 403;
const SUCCESS_CODE = 200;

/**
 * Error Tests
 * - Invalid token error
 *
 * Main Tests
 * - Channels exists but user cannot see channel (private)
 * - User can see channel (private)
 * - User can see channel (public)
 * - User can see channel after joining channel
 * - Two channels with 1 member each
 * - Channel can be seen after inviting and joining
 * - One public, One private 1 member in each channel
 * - One user can see both channels through invite
 * - One user can see both channels after they join
 */

beforeEach(() => {
  clear();
});

test('Invalid token error', () => {
  const token = 'a';

  const expectedError = { message: expect.any(String) };
  const result = channelsList(token);
  expect(result.data.error).toStrictEqual(expectedError);
  expect(result.code).toStrictEqual(AUTH_ERROR);
});

test('Channels exists but user cannot see channel (private)', () => {
  const John = register1().data;
  const Jane = register2().data;

  channelPrivate1(Jane.token);

  const expectedOutput: EmptyChannels = {
    channels: []
  };
  const result = channelsList(John.token);
  expect(result.data).toStrictEqual(expectedOutput);
  expect(result.code).toStrictEqual(SUCCESS_CODE);
});

test('User can see channel (private)', () => {
  const John = register1().data;

  channelPrivate1(John.token);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel B'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('User can see channel (public)', () => {
  const John = register1().data;
  const Jane = register2().data;

  const channelId = channelPublic1(Jane.token).data.channelId;
  channelInvite(Jane.token, channelId, John.authUserId);
  channelJoin(John.token, channelId);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel A'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('User can see channel after joining channel', () => {
  const John = register1().data;
  const Jane = register2().data;

  const channelId = channelPublic1(Jane.token).data.channelId;
  channelJoin(John.token, channelId);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel A'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('Two channels with 1 member each', () => {
  const John = register1().data;
  const Jane = register2().data;

  channelPublic1(John.token);
  channelPrivate1(Jane.token);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel A'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('Channel can be seen after inviting and joining', () => {
  const John = register1().data;
  const Jane = register2().data;

  const channelId = channelPrivate1(Jane.token).data.channelId;
  channelInvite(Jane.token, channelId, John.authUserId);
  channelJoin(John.token, channelId);

  channelsCreate(Jane.token, 'Channel A', false);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel B'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('One public, One private 1 member in each channel', () => {
  const John = register1().data;
  const Jane = register2().data;

  channelPublic1(John.token);
  channelPrivate1(Jane.token);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel A'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('One user can see both channels through invite', () => {
  const John = register1().data;
  const Jane = register2().data;

  const channelId = channelPrivate1(Jane.token).data.channelId;
  channelInvite(Jane.token, channelId, John.authUserId);
  channelJoin(John.token, channelId);

  channelPublic1(John.token);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel B'
    },
    {
      channelId: expect.any(Number),
      name: 'Channel A'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});

test('One user can see both channels after they join', () => {
  const John = register1().data;
  const Jane = register2().data;

  channelPublic1(John.token);
  const channelIdB = channelsCreate(Jane.token, 'Channel B', true).data.channelId;
  channelJoin(John.token, channelIdB);

  const expectedChannels = [
    {
      channelId: expect.any(Number),
      name: 'Channel A'
    },
    {
      channelId: expect.any(Number),
      name: 'Channel B'
    }
  ];

  const channelList = channelsList(John.token);

  expect(new Set(channelList.data.channels)).toStrictEqual(new Set(expectedChannels));
  expect(channelList.code).toStrictEqual(SUCCESS_CODE);
});
