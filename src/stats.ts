import HTTPError from 'http-errors';
import { findToken } from './helpers';
import { UserStats, WorkspaceStats, User, Channel, DM, getData, setData } from './dataStore';

type UserChannelStats = { numChannelsJoined: number, timeStamp: number };
type UserDmStats = { numDmsJoined: number, timeStamp: number };
type UserMessageStats = { numMessagesSent: number, timeStamp: number };
type UserStatsOutput = {
  userStats: {
    channelsJoined: UserChannelStats[],
    dmsJoined: UserDmStats[],
    messagesSent: UserMessageStats[],
    involvementRate: number
}};
type WorkspaceChannelStats = { numChannelsExist: number, timeStamp: number };
type WorkspaceDmStats = { numDmsExist: number, timeStamp: number };
type WorkspaceMessageStats = { numMessagesExist: number, timeStamp: number };
type WorkspaceStatsOutput = {
  workspaceStats: {
    channelsExist: WorkspaceChannelStats[],
    dmsExist: WorkspaceDmStats[],
    messagesExist: WorkspaceMessageStats[],
    utilizationRate: number
}};

// userStatsV1 user/stats/v1 [GET]
/**
 * Fetches the required statistics about this user's use of UNSW Beans.
 * @param {string} token
 * @returns {UserStatsOutput}
 */
export function userStatsV1(token: string): UserStatsOutput {
  const data = getData();
  const user = findToken(token);
  const workspaceStats = data.workspaceStats;

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  // Finds the object for the given user's stats
  const userStats = data.userStats.find((x: UserStats) => x.uId === user.uId);

  const channelsJoined = userStats.channelsJoined;
  const dmsJoined = userStats.dmsJoined;
  const messagesSent = userStats.messagesSent;
  const involvementRate = calculateUserInvolvement(userStats, workspaceStats);

  return {
    userStats: {
      channelsJoined: channelsJoined,
      dmsJoined: dmsJoined,
      messagesSent: messagesSent,
      involvementRate: involvementRate
    }
  };
}

// usersStatsV1 users/stats/v1 [GET]
/**
 * Fetches the required statistics about the workspace's use of UNSW Beans.
 * @param {string} token
 * @returns {WorkspaceStatsOutput}
 */
export function usersStatsV1(token: string): WorkspaceStatsOutput {
  const data = getData();
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  const channelsExist = data.workspaceStats.channelsExist;
  const dmsExist = data.workspaceStats.dmsExist;
  const messagesExist = data.workspaceStats.messagesExist;
  const utilizationRate = calculateWorkspaceUtilization();

  return {
    workspaceStats: {
      channelsExist: channelsExist,
      dmsExist: dmsExist,
      messagesExist: messagesExist,
      utilizationRate: utilizationRate
    }
  };
}

// calculateUserInvolvement
/**
 * Calculates the given user's involvement rate in the beans.
 * @param {UserStats} userStats
 * @param {WorkspaceStats} workspaceStats
 * @returns
 */
function calculateUserInvolvement(userStats: UserStats, workspaceStats: WorkspaceStats): number {
  let involvementRate = 0;

  // User data
  const channelsJoined = userStats.channelsJoined;
  const dmsJoined = userStats.dmsJoined;
  const messagesSent = userStats.messagesSent;

  // Fetches the users most recent stats
  const numChannelsJoined = channelsJoined[channelsJoined.length - 1].numChannelsJoined;
  const numDmsJoined = dmsJoined[dmsJoined.length - 1].numDmsJoined;
  const numMessagesSent = messagesSent[messagesSent.length - 1].numMessagesSent;

  // Workspace data
  const channels = workspaceStats.channelsExist;
  const dms = workspaceStats.dmsExist;
  const msgs = workspaceStats.messagesExist;

  // Fetches the most recent workspace stats
  const numChannels = channels[channels.length - 1].numChannelsExist;
  const numDms = dms[dms.length - 1].numDmsExist;
  const numMsgs = msgs[msgs.length - 1].numMessagesExist;

  const numerator = numChannelsJoined + numDmsJoined + numMessagesSent;
  const denominator = numChannels + numDms + numMsgs;

  // If the denominator is 0, involvement rate is also 0
  if (denominator === 0) {
    involvementRate = 0;
  } else {
    involvementRate = numerator / denominator;
  }

  // If involvement rate is greater than 1, it is capped at 1
  if (involvementRate > 1) {
    involvementRate = 1;
  }

  return involvementRate;
}

// calculateWorkspaceUtilization
function calculateWorkspaceUtilization(): number {
  const data = getData();
  const dms = data.dms;
  const channels = data.channels;

  const everyMember = [];

  // Pushes every dm allMembers array into everyMember
  for (const dm of dms) {
    const members = dm.allMembers;
    for (const uId of members) {
      everyMember.push(uId);
    }
  }

  // Pushes every channel allMembers array into everyMember
  for (const channel of channels) {
    const members = channel.allMembers;
    for (const uId of members) {
      everyMember.push(uId);
    }
  }

  // Number of unique uIds in everyMember
  const numerator = new Set(everyMember).size;

  // Number of currently existing users
  const validUsers = data.users.filter((x: User) => x.isRemoved === false);
  const denominator = validUsers.length;

  return (numerator / denominator);
}

// User stat counters:
// channelUserStatUpdate
/**
 * Updates user stats everytime a channel is joined or left.
 * Must be called at the end of channelsCreate, channelJoin, channelInvite
 * and channelLeave.
 * @param {number} uId
 * @returns {}
 */
export function channelUserStatUpdate(uId: number): Record<string, never> {
  const data = getData();
  const channels = data.channels;

  // Filters all channels that the user is a member of
  const channelsJoined = channels.filter((x: Channel) => x.allMembers.includes(uId));

  const numChannels = channelsJoined.length;
  const timeStamp = Math.floor(Date.now() / 1000);

  // Pushes a new data entry for every channel joined/left
  const userStats = data.userStats.find((x: UserStats) => x.uId === uId);
  userStats.channelsJoined.push({
    numChannelsJoined: numChannels,
    timeStamp: timeStamp
  });

  setData(data);

  return {};
}

// dmUserStatUpdate
/**
 * Updates user stats everytime a dm is joined or left.
 * Must be called at the end of dmCreate and dmLeave.
 * @param {number} uId
 * @returns {}
 */
export function dmUserStatUpdate(uId: number): Record<string, never> {
  const data = getData();
  const dms = data.dms;

  // Filters all dms that the user is a member of
  const dmsJoined = dms.filter((x: DM) => x.allMembers.includes(uId));

  const numDms = dmsJoined.length;
  const timeStamp = Math.floor(Date.now() / 1000);

  // Pushes a new data entry for every dm joined/left
  const userStats = data.userStats.find((x: UserStats) => x.uId === uId);
  userStats.dmsJoined.push({
    numDmsJoined: numDms,
    timeStamp: timeStamp
  });

  setData(data);

  return {};
}

// messageUserStatUpdate
/**
 * Updates user stats everytime a message is sent. Message removals are disregarded.
 * Must be called at the end of messageSend, messageSenddm, messageSendlater,
 * messageSendlaterdm, standupStart.
 * @param {number} uId
 * @returns {}
 */
export function messageUserStatUpdate(uId: number): Record<string, never> {
  const data = getData();

  // Finds the userStats object that matches the given uId
  const userStats = data.userStats.find((x: UserStats) => x.uId === uId);
  const userMessagesSent = userStats.messagesSent;

  // Finds the most recent statistic update
  const latestStat = userMessagesSent[userMessagesSent.length - 1];
  const numMessagesSent = latestStat.numMessagesSent;

  const timeStamp = Math.floor(Date.now() / 1000);
  const numMessages = numMessagesSent + 1;

  // Pushes a new data entry for every message sent
  userStats.messagesSent.push({
    numMessagesSent: numMessages,
    timeStamp: timeStamp
  });

  setData(data);

  return {};
}

// Workspace stat counters:
// channelWorkspaceUpdate
/**
 * Updates workspace stats everytime a new channel is created.
 * Must be called at the end of channelsCreate.
 * @returns {}
 */
export function channelWorkspaceUpdate(): Record<string, never> {
  const data = getData();
  const workspaceStats = data.workspaceStats;

  const timeStamp = Math.floor(Date.now() / 1000);
  const numChannels = data.channels.length;

  // Pushes a new data entry for every channel creation
  workspaceStats.channelsExist.push({
    numChannelsExist: numChannels,
    timeStamp: timeStamp
  });

  setData(data);

  return {};
}

// dmWorkspaceUpdate
/**
 * Updates workspace stats everytime a new dm is created or removed.
 * Must be called at the end of dmCreate and dmRemove.
 * @returns {}
 */
export function dmWorkspaceUpdate(): Record<string, never> {
  const data = getData();
  const workspaceStats = data.workspaceStats;

  const timeStamp = Math.floor(Date.now() / 1000);
  const numDms = data.dms.length;

  // Pushes a new data entry for every dm creation/removal
  workspaceStats.dmsExist.push({
    numDmsExist: numDms,
    timeStamp: timeStamp
  });

  setData(data);

  return {};
}

// messageWorkspaceUpdate
/**
 * Updates workspace stats everytime a new message is sent or deleted.
 * Must be called at the end of messageSend, messageEdit(if message is removed),
 * messageRemove, messageSenddm, dmRemove and messageShare, standupStart,
 * messageSendlater and messageSendlaterDm.
 * @returns {}
 */
export function messageWorkspaceUpdate(): Record<string, never> {
  const data = getData();
  const workspaceStats = data.workspaceStats;
  const dms = data.dms;
  const channels = data.channels;
  let dmMessages = 0;
  let channelMessages = 0;

  for (const dm of dms) {
    dmMessages += dm.messages.length;
  }

  for (const channel of channels) {
    channelMessages += channel.messages.length;
  }

  const timeStamp = Math.floor(Date.now() / 1000);
  const numMessages = dmMessages + channelMessages;

  workspaceStats.messagesExist.push({
    numMessagesExist: numMessages,
    timeStamp: timeStamp
  });

  setData(data);

  return {};
}
