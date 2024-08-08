import { authRegister, clear, channelsCreate, channelJoin, authLogout } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

/*
  Main Cases
  - valid case with 1 person
  - valid case with multiple people registered
  - valid case with 1 person registered + in a channel
  - valid case with multiple people registered + in channel
  Invalid Cases
  - invalid token
  - invalid token given when multiple people already registered
*/

const AUTH_ERROR = 403;
const SUCCESS_CODE = 200;

beforeEach(() => {
  clear();
});

describe('authLogoutV1 valid cases', () => {
  test('deals with normal conditions', () => {
    const user1 = register1().data;
    const validToken = user1.token;
    const result = authLogout(validToken);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsCreate(validToken, 'channel', true).data.error).toStrictEqual({ message: expect.any(String) });
  });
  test('deals with normal conditions - multiple people registered', () => {
    register1();
    register2();
    const validToken = authRegister('joe@gmail.com', 'password', 'Joe', 'Smith').data.token;
    const result = authLogout(validToken);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsCreate(validToken, 'channel', true).data.error).toStrictEqual({ message: expect.any(String) });
  });
  test('valid case with 1 person registered + in a channel', () => {
    const user1 = register1().data;
    const validToken = user1.token;
    channelsCreate(validToken, 'channel', true);
    const result = authLogout(validToken);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsCreate(validToken, 'channel', true).data.error).toStrictEqual({ message: expect.any(String) });
  });
  test('valid case with multiple people registered + in channel', () => {
    const user1 = register1().data;
    const validToken = user1.token;
    const channelId = channelPublic1(user1.token).data.channelId;
    const token2 = register2().data.token;
    const token3 = authRegister('archibald@hotmail.com', 'thisisapassword', 'Archibald Pubert', 'Bartholomew').data.token;
    channelJoin(token2, channelId);
    channelJoin(token3, channelId);
    const result = authLogout(validToken);
    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsCreate(validToken, 'channel', true).data.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('authLogoutV1 invalid cases', () => {
  test('invalid token', () => {
    const result = authLogout('invalidToken');

    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });
});
