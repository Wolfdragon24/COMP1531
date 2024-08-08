import { register1, register2 } from '../testsHelper';
import { userProfileSethandle, userProfile, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Successfully changed handle
 * - No change to handle
 *
 * Error Tests
 * - 1 length handle
 * - 20+ length handle
 * - Handle string contains non-alphanumeric characters
 * - Handle string used by another user
 * - Invalid token
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Successfully Changed Handle', () => {
    const user = register1().data;

    const result = userProfileSethandle(user.token, 'abc');
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);

    const updatedData = userProfile(user.token, user.authUserId).data.user;

    expect(updatedData.handleStr).toStrictEqual('abc');
  });

  test('No change to previous handle', () => {
    const user = register1().data;

    const result = userProfileSethandle(user.token, 'johndoe');
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error Tests', () => {
  test('1 Length Handle', () => {
    const user = register1().data;

    const result = userProfileSethandle(user.token, 'a');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('20+ Length Handle', () => {
    const user = register1().data;

    const result = userProfileSethandle(user.token, 'a'.repeat(21));
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Handle Contains Non-Alphanumeric Characters', () => {
    const user = register1().data;

    const result = userProfileSethandle(user.token, '\\=+]-{\'`~>:;*&%#@!');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Handle Contains Non-Alphanumeric Characters', () => {
    const user = register1().data;
    const handleStr = userProfile(user.token, user.authUserId).data.user.handleStr;
    const secondUser = register2().data;

    const result = userProfileSethandle(secondUser.token, handleStr);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid Token', () => {
    const result = userProfileSethandle('a', 'abc');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
