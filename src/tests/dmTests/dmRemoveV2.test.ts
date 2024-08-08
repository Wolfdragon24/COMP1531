import { clear, dmCreate, dmList, dmRemove } from '../requestsHelper';
import { register1, register2, register3 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successfully removes dms
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid dmId [400]
 * - Auth user is not a member of the dm [403]
 * - Auth user is not the original creator [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Successfully removes a dm', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;

    const result = dmRemove(user1.token, dm.dmId);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(dmList(user1.token).data).toStrictEqual({ dms: [] });
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;

    expect(dmRemove(invalidToken, dm.dmId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmRemove(invalidToken, dm.dmId).code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid dm id', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const invalidDm = dm.dmId + 123456;

    expect(dmRemove(user1.token, invalidDm).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmRemove(user1.token, invalidDm).code).toStrictEqual(REQUEST_ERROR);
  });

  test('Auth user is not in the dm', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const user3 = register3().data; // Jam Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;

    expect(dmRemove(user3.token, dm.dmId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmRemove(user3.token, dm.dmId).code).toStrictEqual(AUTH_ERROR);
  });

  test('Auth user is not the original creator', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;

    expect(dmRemove(user2.token, dm.dmId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmRemove(user2.token, dm.dmId).code).toStrictEqual(AUTH_ERROR);
  });
});
