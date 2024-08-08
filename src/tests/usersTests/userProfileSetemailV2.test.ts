import { register1, register2, user1 } from '../testsHelper';
import { userProfileSetemail, userProfile, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Successfully change email
 * - No changes made to email
 *
 * Error Tests
 * - Invalid email input
 * - Email utilised by another user
 * - Invalid token
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Successfully Change Email', () => {
    const user = register1().data;

    const result = userProfileSetemail(user.token, user1.email + 'a');
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);

    const userData = userProfile(user.token, user.authUserId).data.user;
    expect(userData.email).toStrictEqual(user1.email + 'a');
  });

  test('No change to previous', () => {
    const user = register1().data;

    const result = userProfileSetemail(user.token, user1.email);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error Tests', () => {
  test('Invalid Email Input', () => {
    const user = register1().data;

    const result = userProfileSetemail(user.token, '>:c TwT');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Email Utilised By Another User', () => {
    register1();
    const secondUser = register2().data;

    const result = userProfileSetemail(secondUser.token, user1.email);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid Token', () => {
    const result = userProfileSetemail('a', user1.email);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
