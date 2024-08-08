import { authRegister, channelDetails, channelsCreate, channelsListAll, clear, dmCreate, dmList, userProfile, usersAll } from '../requestsHelper';
import { channelPublic1, register1, register2 } from '../testsHelper';

/**
 * Main Tests
 * - Successfully clears users
 * - Successfully clears channels
 * - Successfully clears dms
 *
 * Error Tests
 * N/A
 */

const OK_CODE = 200;
const BAD_REQUEST_CODE = 400;
const FORBIDDEN_ACCESS_CODE = 403;

beforeEach(() => {
  clear();
});

describe('Sucessful Tests', () => {
  test('Clear with user', () => {
    const user1 = register1().data;

    clear();

    const result = userProfile(user1.token, user1.authUserId);
    expect(result.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Clear with usersAll', () => {
    const user1 = register1().data;
    register2();
    authRegister('limea@gmail.com', 'password', 'Jan', 'Smith');

    clear();

    const result = usersAll(user1.token);
    expect(result.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Clear with channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;

    clear();

    const user2 = register1().data;

    const result = channelDetails(user2.token, channel.channelId);
    expect(result.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Clear with channels', () => {
    const user1 = register1().data;
    channelsCreate(user1.token, 'one', true);
    channelsCreate(user1.token, 'two', true);

    clear();

    const user2 = register2().data;

    const result = channelsListAll(user2.token);
    expect(result.code).toStrictEqual(OK_CODE);
    expect(result.data).toStrictEqual({ channels: [] });
  });

  test('Clear with DM', () => {
    const user1 = register1().data;
    const dm = dmCreate(user1.token, []).data;

    clear();

    const user2 = register1().data;

    const result = channelDetails(user2.token, dm.dmId);
    expect(result.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Clear with DMs', () => {
    const user1 = register1().data;
    const user2 = register2().data;

    dmCreate(user1.token, [user1.authUserId, user2.authUserId]);

    clear();

    const user3 = register1().data;

    const result = dmList(user3.token);
    expect(result.code).toStrictEqual(OK_CODE);
    expect(result.data).toStrictEqual({ dms: [] });
  });
});
