import { channelsCreate, clear, channelsListAll } from '../requestsHelper';
import { register1, channelPublic1, channelPrivate1, publicChannel1, privChannel1 } from '../testsHelper';

// channelsCreateV2 testing:
/*
  Main Cases:
 - normal case -> public
 - normal case -> private
 - length of name is 20 characters -> private

 Error Cases:
 - length of name is > 20 characters -> public
 - length of name is < 1 character - private
 - token is invalid -> public
*/

beforeEach(() => {
  clear();
});

const AUTH_ERROR = 403;
const REQUEST_ERROR = 400;
const SUCCESS_CODE = 200;

describe('Main Cases', () => {
  test('deals with normal conditions for a public channel', () => {
    const test = register1().data.token;
    const channel = channelPublic1(test);
    const expectedChannels = {
      channels: [
        {
          channelId: channel.data.channelId,
          name: publicChannel1.name,
        }
      ]
    };
    expect(channel.data).toStrictEqual({ channelId: expect.any(Number) });
    expect(channel.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsListAll(test).data).toStrictEqual(expectedChannels);
  });

  test('deals with normal conditions for a private channel', () => {
    const test = register1().data.token;
    const channel = channelPrivate1(test);
    const expectedChannels = {
      channels: [
        {
          channelId: channel.data.channelId,
          name: privChannel1.name,
        }
      ]
    };
    expect(channel.data).toStrictEqual({ channelId: expect.any(Number) });
    expect(channel.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsListAll(test).data).toStrictEqual(expectedChannels);
  });

  test('length of name is 20 characters -> private', () => {
    const test = register1().data.token;
    const channel = channelsCreate(test, '12345123451234512345', false);
    const expectedChannels = {
      channels: [
        {
          channelId: channel.data.channelId,
          name: '12345123451234512345',
        }
      ]
    };
    expect(channel.data).toStrictEqual({ channelId: expect.any(Number) });
    expect(channel.code).toStrictEqual(SUCCESS_CODE);
    expect(channelsListAll(test).data).toStrictEqual(expectedChannels);
  });
});

describe('Error Cases', () => {
  test('length of name is greater than 20 characters -> public', () => {
    const test = register1().data.token;
    const channel = channelsCreate(test, '123451234512345123456', true);
    expect(channel.data.error).toStrictEqual({ message: expect.any(String) });
    expect(channel.code).toStrictEqual(REQUEST_ERROR);
    expect(channelsListAll(test).data).toStrictEqual({ channels: [] });
  });

  test('length of name is 0 character -> private', () => {
    const test = register1().data.token;
    const channel = channelsCreate(test, '', false);
    expect(channel.data.error).toStrictEqual({ message: expect.any(String) });
    expect(channel.code).toStrictEqual(REQUEST_ERROR);
    expect(channelsListAll(test).data).toStrictEqual({ channels: [] });
  });

  test('Token is invalid -> public', () => {
    const test = 'a';
    const channel = channelPrivate1(test);
    expect(channel.data.error).toStrictEqual({ message: expect.any(String) });
    expect(channel.code).toStrictEqual(AUTH_ERROR);
  });
});
