import { register1, register2 } from '../testsHelper';
import { adminUserpermissionChange, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main Tests:
 * - Successfully Set Owner and Member
 *
 * Error Tests
 * - User Input Not Valid
 * - Demoting last global owner to member
 * - Only Global Owner Being Set Normal Member
 * - Invalid Permission Id
 * - User Already Has Inputted Permission Id
 * - Authorised User Not Global Owner
 * - Invalid Token
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Successfully Set Owner', () => {
    const user = register1().data;
    const secondUser = register2().data;

    // Checks whether second user has owner permissions - expected false
    const errorResult = adminUserpermissionChange(secondUser.token, user.authUserId, 1);
    expect(errorResult.data.error).toStrictEqual({ message: expect.any(String) });
    expect(errorResult.code).toStrictEqual(AUTH_ERROR);

    // Appends owner permissions to second user - expected success
    const successChange = adminUserpermissionChange(user.token, secondUser.authUserId, 1);
    expect(successChange.data).toStrictEqual({});
    expect(successChange.code).toStrictEqual(SUCCESS_CODE);

    // Checks whether second user has owner permissions - expected true
    const successResult = adminUserpermissionChange(secondUser.token, user.authUserId, 2);
    expect(successResult.data).toStrictEqual({});
    expect(successResult.code).toStrictEqual(SUCCESS_CODE);

    // Checks whether user has been set to member
    const errorChange = adminUserpermissionChange(user.token, secondUser.authUserId, 1);
    expect(errorChange.data.error).toStrictEqual({ message: expect.any(String) });
    expect(errorChange.code).toStrictEqual(AUTH_ERROR);
  });
});

describe('Error Tests', () => {
  test('User Input Not Valid', () => {
    const user = register1().data;

    const result = adminUserpermissionChange(user.token, 0, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Removing last global owner', () => {
    const user = register1().data;

    const result = adminUserpermissionChange(user.token, user.authUserId, 2);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid uId', () => {
    const user = register1().data;
    const invalidId = user.authUserId + 100;

    const result = adminUserpermissionChange(user.token, invalidId, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Only Global Owner Being Set Normal Member', () => {
    const user = register1().data;

    const result = adminUserpermissionChange(user.token, user.authUserId, 0);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Changing a member to member', () => {
    const user = register1().data;
    const member = register2().data;

    const result = adminUserpermissionChange(user.token, member.authUserId, 2);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid Permission Id', () => {
    const user = register1().data;
    const secondUser = register2().data;

    const result = adminUserpermissionChange(user.token, secondUser.authUserId, -1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('User Already Has Inputted Permission Id', () => {
    const user = register1().data;

    const result = adminUserpermissionChange(user.token, user.authUserId, 1);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Authorised User Not Global Owner', () => {
    const user = register1().data;
    const secondUser = register2().data;

    const result = adminUserpermissionChange(secondUser.token, user.authUserId, 0);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid Token', () => {
    const user = register1().data;

    const result = adminUserpermissionChange('a', user.authUserId, 0);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
