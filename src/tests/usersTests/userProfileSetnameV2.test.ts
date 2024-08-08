import { userProfileSetname, userProfile, clear } from '../requestsHelper';
import { register1, user1 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Successful edit of name
 * - No change to name
 *
 * Error Tests
 * - 0 length first name input
 * - 0 length last name input
 * - 50+ length first name input
 * - 50+ length last name input
 * - Invalid token error
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Successful Edit of Name', () => {
    const user = register1().data;

    const result = userProfileSetname(
      user.token, user1.nameFirst + 'a', user1.nameLast + 'a'
    );

    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);

    const updatedData = userProfile(user.token, user.authUserId).data.user;

    expect(updatedData.nameFirst).toStrictEqual(user1.nameFirst + 'a');
    expect(updatedData.nameLast).toStrictEqual(user1.nameLast + 'a');
  });

  test('Successful Edit of Name', () => {
    const user = register1().data;

    const result = userProfileSetname(user.token, user1.nameFirst, user1.nameLast);

    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error Tests', () => {
  test('0 Length First Name Input', () => {
    const user = register1().data;

    const result = userProfileSetname(user.token, '', 'Last');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('0 Length Last Name Input', () => {
    const user = register1().data;

    const result = userProfileSetname(user.token, 'First', '');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('50+ Length First Name Input', () => {
    const user = register1().data;

    const result = userProfileSetname(user.token, 'a'.repeat(51), 'Last');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('50+ Length Last Name Input', () => {
    const user = register1().data;

    const result = userProfileSetname(user.token, 'First', 'b'.repeat(51));

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid token', () => {
    const result = userProfileSetname('a', 'First', 'Last');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
