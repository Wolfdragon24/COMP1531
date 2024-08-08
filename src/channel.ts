import HTTPError from 'http-errors';
import { getData, Message, setData, User, Channel } from './dataStore';
import { getChannel, isUserMemberOfChannel, findToken, getUser, isGlobalOwner } from './helpers';
import { notificationsPush } from './other';
import { channelUserStatUpdate } from './stats';
import { standupActiveV1 } from './standup';
// Return types:
type UserResponse = { uId: number, email: string, nameFirst: string, nameLast: string, handleStr: string };
type ChannelDetails = { name: string, isPublic: boolean, ownerMembers: UserResponse[], allMembers: UserResponse[] };
type Success = Record<string, never>;

// channelDetailsV3 /channel/details/v3 [GET]
/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * provides basic details about the channel.
 * @param {string} token
 * @param {number} channelId
 * @returns {ChannelDetails}
 */
export function channelDetailsV3(token: string, channelId: number): ChannelDetails {
  const data = getData();
  const user = findToken(token);
  const channel = getChannel(channelId);
  const userData = data.users;
  // Checks the validity of inputted token and channelId
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (!channel.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  }

  // Fetches details of the channel

  const ownerUsers = userData.filter((user: User) => { return channel.ownerMembers.includes(user.uId); });
  const ownerMembers = ownerUsers.map((user: User) => {
    return {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
      profileImgUrl: user.profileImgUrl
    };
  });
  const allUsers = userData.filter((user: User) => { return channel.allMembers.includes(user.uId); });
  const allMembers = allUsers.map((user: User) => {
    return {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
      profileImgUrl: user.profileImgUrl
    };
  });

  // Get requested channel object and output data

  return {
    name: channel.name,
    isPublic: channel.public,
    ownerMembers,
    allMembers,
  };
}

// channelJoinV3 /channel/join/v3 [POST]
/**
 * Given a channelId of a channel that the authorised user can join,
 * adds them to that channel.
 * @param {string} token - email
 * @param {number} channelId - password
 * @returns {error}
 * @returns {}
 */
export function channelJoinV3(token: string, channelId: number): Success {
  const data = getData();
  const user = findToken(token);
  const channel = getChannel(channelId);

  // Checks validity of inputted token and channelId

  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (channel.allMembers.includes(user.uId)) {
    throw HTTPError(400, `User of ID ${user.uId} is already a member of channel of ID ${channelId}!`);
  } else if (!isGlobalOwner(user.uId) && channel.public === false) {
    throw HTTPError(403, `Channel of ID ${channelId} is private and user of ID ${user.uId} is not a global owner!`);
  }
  // Adds user's uId to the channel's allMembers in the dataStore and returns empty object
  data.channels[channelId].allMembers.push(user.uId);

  setData(data);

  // Updates user stats
  channelUserStatUpdate(user.uId);

  return {};
}

// channelInviteV3 /channel/invite/v3 [POST]
/**
 * Invites a user to a channel and adds them if successful.
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns {error}
 * @returns {}
 */
export function channelInviteV3(token: string, channelId: number, uId: number): Success {
  let data = getData();
  const user = findToken(token);
  const channel = getChannel(channelId);
  const invited = getUser(uId);

  // Checks validity of inputted token, channelId and uId

  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (invited === undefined) {
    throw HTTPError(400, `No user of ID ${uId} exists!`);
  } else if (isUserMemberOfChannel(uId, channelId)) {
    throw HTTPError(400, `User of ID ${uId} is already a member of channel of ID ${channelId}!`);
  } else if (!isUserMemberOfChannel(user.uId, channelId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  }
  // Adds uId to the channel's allMembers in the dataStore and returns empty object
  data.channels[channelId].allMembers.push(uId);
  data = notificationsPush(data, invited, channelId, true, `${user.handleStr} added you to ${channel.name}`);

  setData(data);

  // Updates user stats
  channelUserStatUpdate(uId);

  return {};
}

// channelMessagesV3 /channel/messages/v3 [GET]
/**
 * Given a channel with ID channelId that the authorised user is a member of,
 * return up to 50 messages between index "start" and "start + 50".
 * Message with index 0 is the most recent message in the channel.
 * @param token User token
 * @param channelId Channel ID
 * @param start Start index of messages to be returned
 * @returns { messages, start, end }
 */
export function channelMessagesV3(token: string, channelId: number, start: number): { messages: Message[], start: number, end: number } {
  const user = findToken(token);
  const channel = getChannel(channelId);

  // Checks validity of inputted token, channelId and start index
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (!channel.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  } else if (start < 0) {
    throw HTTPError(400, 'Start index cannot be negative!');
  }

  const channelMessages = channel.messages;
  const numMessages = channelMessages.length;
  if (start > numMessages) {
    throw HTTPError(400, 'Start index for messages cannot be larger than the amount of messages in channel!');
  }

  // Fetches, from the start index, up to the next 50 messages in the channel and returns it.
  const expectedEnd = start + 50;

  const messages = channelMessages.slice(start, expectedEnd);
  const end = (expectedEnd < channelMessages.length) ? (expectedEnd) : -1;

  return { messages, start, end };
}

// channelLeaveV1 /channel/leave/v2 [POST]
/**
 * Allows a user to leave a channel if successful.
 * @param {string} token
 * @param {number} channelId
 * @returns {error}
 * @returns {}
 */

export function channelLeaveV2(token: string, channelId: number): Success {
  const data = getData();
  const user = findToken(token);
  const channel = getChannel(channelId);

  // Checks validity of inputted token and channelId
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (!channel.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of channel of ID ${channelId}!`);
  } else if (standupActiveV1(token, channelId).isActive === true) {
    const index = data.standups.findIndex((object: Record<string, any>) => { return object.userStart === user.uId; });
    if (index !== -1) {
      throw HTTPError(400, `User is of ID ${user.uId} the starter of an active standup!`);
    }
  }

  // removes member from channel
  const indexChannel = data.channels.findIndex((object: Channel) => { return object.channelId === channelId; });
  const indexAll = channel.allMembers.indexOf(user.uId);

  const indexOwner = channel.ownerMembers.indexOf(user.uId);
  channel.allMembers.splice(indexAll, 1);
  if (indexOwner !== -1) {
    channel.ownerMembers.splice(indexOwner, 1);
  }
  data.channels[indexChannel] = channel;
  setData(data);

  // Updates user stats
  channelUserStatUpdate(user.uId);
  return {};
}

// channelAddownerV1 /channel/addowner/v2 [POST]
/**
 * Make user an owner of the channel.
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns {error}
 * @returns {}
 */
export function channelAddownerV2(token: string, channelId: number, uId: number): Success {
  const data = getData();
  const user = findToken(token);
  const channel = getChannel(channelId);
  const added = getUser(uId);

  // Checks validity of inputted token, channelId and uId
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (added === undefined) {
    throw HTTPError(400, `No user of ID ${uId} exists!`);
  } else if (!channel.allMembers.includes(uId)) {
    throw HTTPError(400, `User of ID ${uId} exists in the channel!`);
  } else if (channel.ownerMembers.includes(uId)) {
    throw HTTPError(400, `User of ID ${uId} already an owner of the channel!`);
  } else if (!channel.ownerMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} does not have permissions in channel of ID ${channelId}`);
  }

  // Adds uId to the channel's ownerMembers in the dataStore and returns empty object
  const indexChannel = data.channels.findIndex((object: Channel) => { return object.channelId === channelId; });
  data.channels[indexChannel].ownerMembers.push(added.uId);
  setData(data);
  return {};
}

// channelRemoveownerV1 /channel/removeowner/v2 [POST]
/**
 * Removes owner permissions from channel
 * @param {string} token
 * @param {number} channelId
 * @param {number} uId
 * @returns {error}
 * @returns {}
 */
export function channelRemoveownerV2(token: string, channelId: number, uId: number): Success {
  const data = getData();
  const user = findToken(token);
  const channel = getChannel(channelId);
  const removed = getUser(uId);

  // Checks validity of inputted token, channelId and uId
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (channel === undefined) {
    throw HTTPError(400, `No channel of ID ${channelId} exists!`);
  } else if (removed === undefined) {
    throw HTTPError(400, `No user of ID ${uId} exists!`);
  } else if (!channel.ownerMembers.includes(uId)) {
    throw HTTPError(400, `User if ID ${uId} not an owner of the channel!`);
  } else if (channel.ownerMembers.length === 1) {
    throw HTTPError(400, `User of ID ${uId} is the only owner of the channel!`);
  } else if (!channel.ownerMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} does not have permissions in channel of ID ${channelId}`);
  }

  // Using splice, removes user from ownerMembers and sets it back to dataStore
  const indexOwner = channel.ownerMembers.indexOf(removed.uId);
  channel.ownerMembers.splice(indexOwner, 1);
  data.channels[channel.channelId] = channel;

  setData(data);
  return {};
}
