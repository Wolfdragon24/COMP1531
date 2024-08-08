import { authRegister, userProfile, clear } from '../requestsHelper';
import { register1, register2 } from '../testsHelper';

/*
  Main Cases
  - valid register
  - multiple valid registers
  - name with spaces
  - names same, different emails + password (catches handle issues)
  - first name being 50 characters
  - first name being 1 character long
  - last name being 50 characters
  - last name being 1 character long
  - case with invalid characters as first name
  - case with invalid characters as last name
  - case with invalid characters as first & last name

  Error Cases
  - email case where an email is not valid
  - email case where email address is already being used
  - password length < 6 characters
  - first name being longer than 50 characters
  - no first name
  - last name being longer than 50 characters
  - no last name
  - no email
  - no password
*/

const REQUEST_ERROR = 400;
const SUCCESS_CODE = 200;

beforeEach(() => {
  clear();
});

describe('Main Cases', () => {
  test('deals with normal conditions', () => {
    const user = register1();
    expect(user.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user.data.token, user.data.authUserId).data.user).toMatchObject({
      uId: user.data.authUserId,
      email: 'john@jdoe.com',
      nameFirst: 'John',
      nameLast: 'Doe',
      handleStr: 'johndoe'
    });
  });

  test('deals with multiple new registers', () => {
    const user1 = register1();
    const user2 = register2();

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(user2.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user2.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'john@jdoe.com',
      nameFirst: 'John',
      nameLast: 'Doe',
      handleStr: 'johndoe'
    });
    expect(userProfile(user2.data.token, user2.data.authUserId).data.user).toMatchObject({
      uId: user2.data.authUserId,
      email: 'jane@jdoe.com',
      nameFirst: 'Jane',
      nameLast: 'Doe',
      handleStr: 'janedoe'
    });
  });

  test('deals with names with spaces', () => {
    const user = authRegister('archibald@hotmail.com', 'thisisapassword', 'Archibald Pubert', 'Bartholomew');
    expect(user.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user.data.token, user.data.authUserId).data.user).toMatchObject({
      uId: user.data.authUserId,
      email: 'archibald@hotmail.com',
      nameFirst: 'Archibald Pubert',
      nameLast: 'Bartholomew',
      handleStr: 'archibaldpubertbarth'
    });
  });

  test('deals with handle issues', () => {
    const user1 = authRegister('joe@gmail.com', 'password', 'Joe', 'Mama');
    const user2 = authRegister('joe@hotmail.com', 'thisisapassword', 'Joe', 'Mama');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(user2.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user2.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: 'Joe',
      nameLast: 'Mama',
      handleStr: 'joemama'
    });
    expect(userProfile(user2.data.token, user2.data.authUserId).data.user).toMatchObject({
      uId: user2.data.authUserId,
      email: 'joe@hotmail.com',
      nameFirst: 'Joe',
      nameLast: 'Mama',
      handleStr: 'joemama0'
    });
  });

  test('first name = 50 characters', () => {
    const user1 = authRegister('joe@gmail.com', 'password', '12345123451234512345123451234512345123451234512345', 'Mama');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: '12345123451234512345123451234512345123451234512345',
      nameLast: 'Mama',
      handleStr: '12345123451234512345'
    });
  });

  test('first name = 1 character', () => {
    const user1 = authRegister('joe@gmail.com', 'password', '1', 'Mama');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: '1',
      nameLast: 'Mama',
      handleStr: '1mama'
    });
  });

  test('last name = 50 characters', () => {
    const user1 = authRegister('joe@gmail.com', 'password', 'Joe', '12345123451234512345123451234512345123451234512345');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: 'Joe',
      nameLast: '12345123451234512345123451234512345123451234512345',
      handleStr: 'joe12345123451234512'
    });
  });

  test('last name = 1 character', () => {
    const user1 = authRegister('joe@gmail.com', 'password', 'Joe', '1');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: 'Joe',
      nameLast: '1',
      handleStr: 'joe1'
    });
  });

  test('invalid characters within first name', () => {
    const user1 = authRegister('joe@gmail.com', 'password', 'Joeπ', 'Mama');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: 'Joeπ',
      nameLast: 'Mama',
      handleStr: 'joemama'
    });
  });

  test('invalid characters within last name', () => {
    const user1 = authRegister('joe@gmail.com', 'password', 'Joe', 'Mamaπ');

    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: 'Joe',
      nameLast: 'Mamaπ',
      handleStr: 'joemama'
    });
  });

  test('invalid characters within first and last name', () => {
    const user1 = authRegister('joe@gmail.com', 'password', '*!)@#@!', '@#)!@π');
    expect(user1.data).toStrictEqual({ token: expect.any(String), authUserId: expect.any(Number) });
    expect(user1.code).toStrictEqual(SUCCESS_CODE);
    expect(userProfile(user1.data.token, user1.data.authUserId).data.user).toMatchObject({
      uId: user1.data.authUserId,
      email: 'joe@gmail.com',
      nameFirst: '*!)@#@!',
      nameLast: '@#)!@π',
      handleStr: expect.any(String)
    });
  });
});

describe('Error Cases', () => {
  test('deals with invalid email', () => {
    const result = authRegister('joe', 'password', 'Joe', 'Mama');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('deals with emails that already exist', () => {
    authRegister('joe@gmail.com', 'password', 'Joe', 'Mama');
    const result = authRegister('joe@gmail.com', '123456789', 'Archibald', 'Bartholomew');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('password length < 6 characters', () => {
    const result = authRegister('joe@gmail.com', '12345', 'Joe', 'Mama');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('first name > 50 characters', () => {
    const result = authRegister('joe@gmail.com', 'password', '123451234512345123451234512345123451234512345123456', 'Mama');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('deals with no first name input', () => {
    const result = authRegister('joe@gmail.com', 'password', '', 'Mama');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('last name > 50 characters', () => {
    const result = authRegister('joe@gmail.com', 'password', 'Joe', '123451234512345123451234512345123451234512345123456');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('no last name', () => {
    const result = authRegister('joe@gmail.com', 'password', 'Joe', '');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('no email', () => {
    const result = authRegister('', 'password', 'Joe', 'Mama');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('no password', () => {
    const result = authRegister('joe@gmail.com', '', 'Joe', 'Mama');
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });
});
