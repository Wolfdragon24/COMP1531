import { channelJoin, clear, standupActive, standupStart, channelMessages, standupSend } from '../requestsHelper';
import { channelPublic1, register1, register2 } from '../testsHelper';
import { findToken } from '../../helpers';
const wait = require('wait-for-stuff');

/**
 * Main Tests
 * - Standup started successfully. Active and expired standup check
 * - Standup started with no messages sent. Standup active check with another persons token.
 * - Standup started with messages sent
 *
 * Error Tests for standupActive
 * - channelId does not refer to a valid channel
 * - invalid token
 * - channelId refers to valid channel the user is not a member of
 *
 * Error Tests for standupSend
 * - channelId is invalid
 * - Invalid token
 * - Length of message is over 1000 characters long
 * - No active standup present
 * - channelId refers to a valid channel of which the user is not a member of
 *
 * Error Tests for standupStart
 * - channelId is invalid
 * - Invalid token
 * - length is negative
 * - There is already an active standup in the channel
 * - channelId refers to a valid channel of which the user is not a member of
 */

const OK_CODE = 200;
const BAD_REQUEST_CODE = 400;
const FORBIDDEN_ACCESS_CODE = 403;

jest.setTimeout(10000);

beforeEach(() => {
  clear();
});

describe('Successful Tests for standupStart', () => {
  test('Standup started successfully. Active and expired standup check', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const standupResult = standupStart(user1.token, channel.channelId, 3);
    const timeCreated = Math.floor(Date.now() / 1000);
    expect(standupResult.code).toStrictEqual(OK_CODE);
    expect(standupResult.data.timeFinish).toBeLessThanOrEqual(timeCreated + 10);

    let activeResult = standupActive(user1.token, channel.channelId);
    expect(activeResult.data.isActive).toStrictEqual(true);
    expect(activeResult.data.timeFinish).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 5);
    expect(activeResult.code).toStrictEqual(OK_CODE);

    wait.for.time(4);

    activeResult = standupActive(user1.token, channel.channelId);
    expect(activeResult.code).toStrictEqual(OK_CODE);
    expect(activeResult.data.isActive).toStrictEqual(false);
    expect(activeResult.data.timeFinish).toStrictEqual(null);
  });

  test('Standup started with no messages sent. Standup active check with another persons token.', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    channelJoin(user2.token, channel.channelId);
    standupStart(user1.token, channel.channelId, 3);

    const activeResult = standupActive(user2.token, channel.channelId);
    expect(activeResult.code).toStrictEqual(OK_CODE);
    expect(activeResult.data.isActive).toStrictEqual(true);
    expect(activeResult.data.timeFinish).toBeLessThanOrEqual(Math.floor(Date.now() / 1000) + 5);

    const expectedObject = channelMessages(user1.token, channel.channelId, 0).data;

    wait.for.time(5);

    expect(channelMessages(user1.token, channel.channelId, 0).data).toStrictEqual(expectedObject);

    wait.for.time(3);
  });

  test('Standup started with messages sent', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    standupStart(user1.token, channel.channelId, 3);

    let messageToBeSent = '';
    for (let i = 0; i < 10; i++) {
      standupSend(user1.token, channel.channelId, 'a'.repeat(i));
      messageToBeSent += (`${findToken(user1.token).handleStr}: ${'a'.repeat(i)}\n`);
    }
    const timeSent = Math.floor(Date.now() / 1000) + 10;
    messageToBeSent = messageToBeSent.trimEnd();

    wait.for.time(5);

    const messages = channelMessages(user1.token, channel.channelId, 0).data;
    expect(messages.messages[0].message).toStrictEqual(messageToBeSent);
    expect(messages.messages[0].timeSent).toBeLessThanOrEqual(timeSent);

    wait.for.time(2);
  });
});

describe('Error Tests for standupActive', () => {
  test('channelId does not refer to a valid channel', () => {
    const user1 = register1().data;

    const activeResult = standupActive(user1.token, 0);
    expect(activeResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(activeResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Invalid token', () => {
    const user1 = register1().data;

    const activeResult = standupActive(user1.token + 'asjdhgajkhdgja', 0);
    expect(activeResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(activeResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channelId refers to valid channel the user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;
    standupStart(user1.token, channel.channelId, 10);

    const activeResult = standupActive(user2.token, channel.channelId);
    expect(activeResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(activeResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Error Tests for standupSend', () => {
  test('channelId is invalid', () => {
    const user1 = register1().data;

    const sendResult = standupSend(user1.token, 0, 'Hello World!');
    expect(sendResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(sendResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Invalid token', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    standupStart(user1.token, channel.channelId, 2);

    const sendResult = standupSend(user1.token + 'asjhdgajhdgb', 0, 'Hello World!');
    expect(sendResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(sendResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Length of message is over 1000 characters long', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;

    let message = '';
    for (let i = 0; i < 1001; i++) {
      message = message.concat('a');
    }
    const sendResult = standupSend(user1.token, channel1.channelId, message);
    expect(sendResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(sendResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('No active standup present', () => {
    const user1 = register1().data;
    const channel1 = channelPublic1(user1.token).data;

    const sendResult = standupSend(user1.token, channel1.channelId, 'Hello World!');
    expect(sendResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(sendResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channelId refers to a valid channel of which the user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel1 = channelPublic1(user1.token).data;
    standupStart(user1.token, channel1.channelId, 10);

    const sendResult = standupSend(user2.token, channel1.channelId, 'Hello World!');
    expect(sendResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(sendResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});

describe('Error Tests for standupStart', () => {
  test('channelId is invalid', () => {
    const user1 = register1().data;

    const startResult = standupStart(user1.token, 0, 10);
    expect(startResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(startResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('Invalid token', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    const standupResult = standupStart(user1.token + 'asdjhgasdhg', channel.channelId, 3);

    expect(standupResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(standupResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('length is negative', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;

    const startResult = standupStart(user1.token, channel.channelId, -1);
    expect(startResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(startResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('There is already an active standup in the channel', () => {
    const user1 = register1().data;
    const channel = channelPublic1(user1.token).data;
    standupStart(user1.token, channel.channelId, 90);

    const startResult = standupStart(user1.token, channel.channelId, 10);
    expect(startResult.code).toStrictEqual(BAD_REQUEST_CODE);
    expect(startResult.data.error).toStrictEqual({ message: expect.any(String) });
  });

  test('channelId refers to a valid channel of which the user is not a member of', () => {
    const user1 = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user1.token).data;

    const startResult = standupStart(user2.token, channel.channelId, 10);
    expect(startResult.code).toStrictEqual(FORBIDDEN_ACCESS_CODE);
    expect(startResult.data.error).toStrictEqual({ message: expect.any(String) });
  });
});
