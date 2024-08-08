import { clear, channelMessages, messageSend, messageRemove } from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

type EmptyMessages = {
  messages: [];
  start: number;
  end: number;
};

/**
 * Test list:
 * Errors:
 * - Invalid token
 * - Invalid messageId (non existent)
 * - the messageId does not refer to a message sent by the auth user
 *
 * Success:
 * - Message successfuly removed from dm
 * - Correct return type of {}
 */

beforeEach(() => {
  clear();
});

describe('messageRemoveV1 error tests', () => {
  test('invalid token', () => {
    const invalidToken = 'a';
    const result = messageRemove(invalidToken, 1);

    expect(result.code).toStrictEqual(403);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('invalid messageId', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const message = messageSend(user.token, channel.channelId, 'hello').data;
    const result = messageRemove(user.token, message.messageId + 12398);

    expect(result.code).toStrictEqual(400);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test("messageId doesn't refer to a message sent by the auth user", () => {
    const user = register1().data;
    const user1 = register2().data;
    const channel = channelPublic1(user.token).data;
    const message = messageSend(user.token, channel.channelId, 'hello').data;
    const result = messageRemove(user1.token, message.messageId);

    expect(result.code).toStrictEqual(403);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('messageRemoveV1 tests', () => {
  test('message successfully removed ', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const message = messageSend(user.token, channel.channelId, 'hello').data;
    const start = 0;

    const expectedMessages: EmptyMessages = {
      messages: [],
      start: start,
      end: -1
    };
    const result = messageRemove(user.token, message.messageId);
    expect(result.code).toStrictEqual(200);
    expect(result.data).toStrictEqual({});
    expect(channelMessages(user.token, channel.channelId, start).data).toStrictEqual(expectedMessages);
  });
});
