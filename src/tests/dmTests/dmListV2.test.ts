import { clear, dmCreate, dmList } from '../requestsHelper';
import { register1, register2 } from '../testsHelper';

const SUCCESS_CODE = 200;
const AUTH_ERROR = 403;

/**
 * Main tests:
 * - Successfully lists dms
 *
 * Error tests:
 * - Invalid token [403]
 * - Same group of users attempt to make another dm (see assumption) [403]
 */

beforeEach(() => {
  clear();
});

// success tests
describe('Main Tests', () => {
  test('Returns no DM channels', () => {
    const userJohn = register1().data; // John Doe
    const dms = dmList(userJohn.token);
    expect(dms.data).toStrictEqual({ dms: [] });
    expect(dms.code).toStrictEqual(SUCCESS_CODE);
  });

  test('Successfully creates a dm', () => {
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    const dm = dmCreate(user1.token, [user2.authUserId]);
    const dmId = dm.data;

    const expected = {
      dms: [{
        dmId: dmId.dmId,
        name: 'janedoe, johndoe'
      }]
    };

    expect(dmList(user1.token).data).toStrictEqual(expected);
    expect(dmList(user1.token).code).toStrictEqual(SUCCESS_CODE);
  });
});

// error tests
describe('Error Tests', () => {
  test('Invalid token', () => {
    const invalidToken = 'a';
    const user1 = register1().data; // John Doe
    const user2 = register2().data; // Jane Doe
    dmCreate(user1.token, [user2.authUserId]);

    expect(dmList(invalidToken).data.error).toStrictEqual({ message: expect.any(String) });
    expect(dmList(invalidToken).code).toStrictEqual(AUTH_ERROR);
  });
});
