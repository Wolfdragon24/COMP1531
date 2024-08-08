import { clear, authPasswordresetRequest, authPasswordresetReset } from '../requestsHelper';
import { register1 } from '../testsHelper';
import { getData } from '../../dataStore';

/**
 * Tests
 * - normal conditions passed through
 * - resetCode is invalid
 * - newPassword is less than 6 characters long
*/

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;

beforeEach(() => {
  clear();
});

describe('Valid password reset', () => {
  test('normal conditions', () => {
    register1();
    authPasswordresetRequest('john@jdoe.com');

    const data = getData();
    const code = data.resetCodes[0].resetCode;
    const result = authPasswordresetReset(code, 'thisisanewpassword');

    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(result.data).toMatchObject({});
    expect(authPasswordresetReset(code, 'thisisanewpassword').code).toStrictEqual(REQUEST_ERROR);
  });
});

describe('Invalid password reset', () => {
  test('Reset code is invalid', () => {
    register1();
    authPasswordresetRequest('john@jdoe.com');

    const result = authPasswordresetReset('invalidcode', 'thisisanewpassword');

    expect(result.code).toStrictEqual(REQUEST_ERROR);
    expect(result.data.error).toMatchObject({ message: expect.any(String) });
  });

  test('New password is less than 6 characters long', () => {
    register1();
    authPasswordresetRequest('john@jdoe.com');

    const data = getData();
    const code = data.resetCodes[0].resetCode;
    const result = authPasswordresetReset(code, 'bad');

    expect(result.code).toStrictEqual(REQUEST_ERROR);
    expect(result.data.error).toMatchObject({ message: expect.any(String) });
  });
});
