import { authLogin, authLogout } from '../requestsHelper';
import { register1, register2, user1, user2 } from '../testsHelper';

/*
 Main cases
 - Successful login for a users
 - Successful login for multiple users

 Error cases
 - No inputs (two blank inputs)
 - Wrong email, correct password
 - Correct email, wrong password
 - Non registered user
*/

const REQUEST_ERROR = 400;
const SUCCESS_CODE = 200;

const user3 = { email: 'richard@gmail.com', password: 'epicpogchamp' };

const token1 = register1().data.token;
const token2 = register2().data.token;

describe('Success tests', () => {
  test('Test successful authLoginV2 for user1', () => {
    const result = authLogin(user1.email, user1.password);

    expect(result.data).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    expect(result.code).toStrictEqual(SUCCESS_CODE);
  });
  test('Test successful authLoginV2 for multiple users after logged out', () => {
    authLogout(token1);
    authLogout(token2);
    const result1 = authLogin(user1.email, user1.password);
    const result2 = authLogin(user2.email, user2.password);

    expect(result1.data).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    expect(result1.code).toStrictEqual(SUCCESS_CODE);
    expect(result2.data).toStrictEqual({ authUserId: expect.any(Number), token: expect.any(String) });
    expect(result2.code).toStrictEqual(SUCCESS_CODE);
  });
});

describe('Error testing', () => {
  test('Empty inputs', () => {
    const result = authLogin('', '');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Correct Email with empty passcode', () => {
    const result = authLogin(user1.email, '');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Registered email with incorrect password', () => {
    const result = authLogin(user1.email, 'wrong123');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Empty email with correct password', () => {
    const result = authLogin('', user3.password);

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Non registered email with correct password', () => {
    const result = authLogin('abcde@gmail.com', user1.password);

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Using another users password', () => {
    const result = authLogin(user2.email, user1.password);

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });
});
