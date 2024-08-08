import { clear, userProfile } from '../requestsHelper';
import { register1 } from '../testsHelper';

/**
 * Main Tests
 * - Returns details of user
 *
 * Error Tests
 * - Token is invalid
 * - userId is invalid
 */

beforeEach(() => {
  clear();
});

const AUTH_ERROR = 403;
const REQUEST_ERROR = 400;
const SUCCESS_CODE = 200;

describe('user/profile/v2 Endpoint', () => {
  test('Returns details of user', () => {
    const user = register1().data;
    const expectedProfile = {
      uId: user.authUserId,
      email: 'john@jdoe.com',
      nameFirst: 'John',
      nameLast: 'Doe',
      handleStr: 'johndoe'
    };
    const result = userProfile(user.token, user.authUserId);
    expect(result.data).toMatchObject({ user: expectedProfile });
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error Tests', () => {
  test('Invalid token, invalid userId', () => {
    const invalidToken = 'a';
    const invalidId = 1;
    const result = userProfile(invalidToken, invalidId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Valid token, invalid userId', () => {
    const invalidId = -99999;
    const user = register1().data;
    const result = userProfile(user.token, invalidId);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });
});
