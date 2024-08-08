import { clear, authPasswordresetRequest, channelsCreate, channelsListAll } from '../requestsHelper';
import { register1 } from '../testsHelper';
/**
 * normal conditions passed through
 * no error raised when given invalid email
*/

const SUCCESS_CODE = 200;

beforeEach(() => {
  clear();
});

describe('auth/passwordreset/request/v1 tests', () => {
  test('Valid password request', () => {
    const user = register1().data;
    const result = authPasswordresetRequest('john@jdoe.com');
    expect(result.data).toMatchObject({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsCreate(user.token, 'channel', true).data.error).toMatchObject({ message: expect.any(String) });
  });
  test('invalid password request', () => {
    const user = register1().data;
    const result = authPasswordresetRequest('thisisnotreal@jdoe.com');
    expect(result.data).toMatchObject({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);
    const channel = channelsCreate(user.token, 'channel', true).data.channelId;
    const expectedChannels = {
      channels: [
        {
          channelId: channel,
          name: 'channel',
        }
      ]
    };
    expect(channelsListAll(user.token).data).toStrictEqual(expectedChannels);
  });
});
