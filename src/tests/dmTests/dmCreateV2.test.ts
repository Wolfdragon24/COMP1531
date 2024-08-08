import { clear, dmCreate, dmList } from '../requestsHelper';
import { register1, register2 } from '../testsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successfully created DM
 *
 * Error tests:
 * - Invalid token [403]
 * - Invalid user id [400]
 * - Duplicate uId [400]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Successfully creates a dm', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]);
    const dmId = dm.data;
    const expected = {
      dmId: expect.any(Number)
    };
    expect(dm.data).toStrictEqual(expected);
    expect(dm.code).toStrictEqual(SUCCESS_CODE);

    const expected1 = {
      dms: [{
        dmId: dmId.dmId,
        name: 'janedoe, johndoe'
      }]
    };

    expect(dmList(user1.token).data).toStrictEqual(expected1);

    const dm2 = dmCreate(user2.token, [user1.authUserId]);
    const dmId2 = dm2.data;

    const expected2 = {
      dms: [{
        dmId: dmId.dmId,
        name: 'janedoe, johndoe'
      }, {
        dmId: dmId2.dmId,
        name: 'janedoe, johndoe'
      }]
    };

    expect(dmList(user1.token).data).toStrictEqual(expected2);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';

    expect(dmCreate(invalidToken, [1]).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmCreate(invalidToken, [1]).code).toStrictEqual(AUTH_ERROR);
  });

  test('Invalid user id', () => {
    const user = register1().data;
    const uId = user.authUserId + 123456;

    expect(dmCreate(user.token, [uId]).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmCreate(user.token, [uId]).code).toStrictEqual(REQUEST_ERROR);
  });

  test('Duplicate user id', () => {
    const user = register1().data;
    const user2 = register2().data;
    const uId = user2.authUserId;

    expect(dmCreate(user.token, [uId, uId]).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmCreate(user.token, [uId, uId]).code).toStrictEqual(REQUEST_ERROR);
  });
});
