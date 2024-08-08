import { clear, dmCreate, dmDetails, dmLeave } from '../requestsHelper';
import { register1, register2, register3 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successfully leaves dm
 * - - Last member leaving doesn't delete the dm
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid dmId [400]
 * - Auth user is not a member of the dm [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Successfully leaves the dm', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const leave1 = dmLeave(user2.token, dm.dmId);

    const expected1 = {
      name: 'janedoe, johndoe',
      members: [{
        uId: user1.authUserId,
        email: 'john@jdoe.com',
        nameFirst: 'John',
        nameLast: 'Doe',
        handleStr: 'johndoe',
        profileImgUrl: expect.any(String)
      }]
    };

    expect(leave1.data).toStrictEqual({});
    expect(leave1.code).toStrictEqual(SUCCESS_CODE);
    expect(dmDetails(user1.token, dm.dmId).data).toStrictEqual(expected1);

    const leave2 = dmLeave(user1.token, dm.dmId);

    expect(leave2.data).toStrictEqual({});
    expect(leave2.code).toStrictEqual(SUCCESS_CODE);
    expect(dmDetails(user1.token, dm.dmId).data.error).toStrictEqual({ message: expect.any(String) });
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const invalidToken = 'a';

    expect(dmLeave(invalidToken, dm.dmId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmLeave(invalidToken, dm.dmId).code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid dm id', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;
    const invalidDm = dm.dmId + 123456;

    expect(dmLeave(user1.token, invalidDm).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmLeave(user1.token, invalidDm).code).toStrictEqual(REQUEST_ERROR);
  });

  test('Auth user is not a member', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const user3 = register3().data; // Jam Doe
    const dm = dmCreate(user1.token, [user2.authUserId]).data;

    expect(dmLeave(user3.token, dm.dmId).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmLeave(user3.token, dm.dmId).code).toStrictEqual(AUTH_ERROR);
  });
});
