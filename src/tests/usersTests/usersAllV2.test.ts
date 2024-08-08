import { register1, register2 } from '../testsHelper';
import { usersAll, userProfile, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Returns 2 user details
 *
 * Error Tests
 * - Invalid token
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Returns 2 User Details', () => {
    const user = register1().data;
    const secondUser = register2().data;

    const result = usersAll(user.token);
    expect(new Set(result.data.users)).toStrictEqual(new Set([
      userProfile(user.token, user.authUserId).data.user,
      userProfile(secondUser.token, secondUser.authUserId).data.user
    ]));
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error Tests', () => {
  test('Invalid Token', () => {
    const result = usersAll('a');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
