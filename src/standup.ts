import { findToken, getChannel, generateMessageId } from './helpers';
import { getData, setData } from './dataStore';
import { messageUserStatUpdate, messageWorkspaceUpdate } from './stats';
import HTTPError from 'http-errors';

// standupStartV1 standup/start/v1 [POST]
/**
 * Starts a standup in the specified channel
 * @param {string} token - token
 * @param {number} channelId - id of channel
 * @param {number} length - length of standup
 * @returns {timeFinish}
 * @returns {{error}} on error
 */
export function standupStartV1(token: string, channelId: number, length: number): { timeFinish: number } {
  const user = findToken(token);
  const channel = getChannel(channelId);

  // Error checking
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  } else if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId!');
  } else if (length < 0) {
    throw HTTPError(400, 'Length of standup cannot be negative!');
  } else if (!channel.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  } else if (standupActiveV1(token, channelId).isActive === true) {
    throw HTTPError(400, 'There is already an active standup in this channel!');
  }

  // Pushes temporary data into standups in dataStore
  const data = getData();
  const timeFinish = Math.floor(Date.now() / 1000) + length;
  data.standups.push(
    {
      channelId: channelId,
      buffer: '',
      timeFinish: timeFinish,
      userStart: user.uId
    }
  );
  setData(data);

  // Closes standup after specified length has passed
  setTimeout(() => standupClose(channelId, user.uId), (length * 1000));

  return { timeFinish };
}

// standupActiveV1 standup/active/v1 [GET]
/**
 * Checks if a standup is active in a channel
 * @param {string} token - token
 * @param {number} channelId - id of channel
 * @returns {isActive}
 * @returns {timeFinish}
 * @returns {{error}} on error
 */
export function standupActiveV1(token: string, channelId: number): { isActive: boolean, timeFinish: number } {
  const user = findToken(token);
  const channel = getChannel(channelId);

  // Error checking
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  } else if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId!');
  } else if (!channel.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  }

  const data = getData();
  const index = data.standups.findIndex((object: Record<string, any>) => { return object.channelId === channelId; });

  // Return status of standup
  if (index === -1) {
    return { isActive: false, timeFinish: null };
  } else {
    return { isActive: true, timeFinish: data.standups[index].timeFinish };
  }
}

// standupSendV1 standup/send/v1 [POST]
/**
 * Sends a message in the specified standup
 * @param {string} token - token
 * @param {number} channelId - id of channel
 * @param {string} message - length of standup
 * @returns { }
 * @returns {{error}} on error
 */
export function standupSendV1(token: string, channelId: number, message: string): Record<string, never> {
  const user = findToken(token);
  const channel = getChannel(channelId);

  // Error checking
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  } else if (channel === undefined) {
    throw HTTPError(400, 'Invalid channelId!');
  } else if (!channel.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  } else if (message.length > 1000) {
    throw HTTPError(400, 'Message length cannot be over 1000 characters!');
  } else if (standupActiveV1(token, channelId).isActive === false) {
    throw HTTPError(400, 'There is no active standup in this channel!');
  }

  const data = getData();
  const index = data.standups.findIndex((object: Record<string, any>) => { return object.channelId === channelId; });

  // Adds message to the standup buffer
  data.standups[index].buffer += `${user.handleStr}: ${message}\n`;
  setData(data);
  return {};
}

// Helper function to close standups after the required time
/**
 * @param {number} channelId - id of channel
 * @param {number} uId - uId of user starting standup
 * @returns { }
 */
function standupClose(channelId: number, uId: number) {
  const data = getData();

  const index = data.standups.findIndex((object: Record<string, any>) => { return object.channelId === channelId; });
  const channelIndex = data.channels.findIndex((object: Record<string, any>) => { return object.channelId === channelId; });

  // Error message to catch tests that might misbehave
  if (index === -1 || channelIndex === -1) {
    return 'Internal Error (invalid channel or user id)';
  }

  // Do not send a message if no messages are sent in stndup
  if (data.standups[index].buffer === '') {
    data.standups.splice(index, 1);
    return;
  }

  // Send the formatted message into channel
  data.channels[channelIndex].messages.unshift(
    {
      messageId: generateMessageId('channels', channelId),
      uId: uId,
      message: data.standups[index].buffer.trimEnd(),
      timeSent: data.standups[index].timeFinish,
      reacts: [],
      isPinned: false
    }
  );

  messageUserStatUpdate(uId);
  messageWorkspaceUpdate();
  data.standups.splice(index, 1);
  setData(data);
}
