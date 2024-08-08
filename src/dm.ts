import HTTPError from 'http-errors';
import { Message, DM, getData, setData, User } from './dataStore';
import { findToken, getUser, makeNewDM, getDM } from './helpers';
import { notificationsPush } from './other';
import { dmUserStatUpdate, dmWorkspaceUpdate } from './stats';

type DmOutput = {
  dmId: number,
  name: string
};

type MemberOutput = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string
};

// dmCreateV1 /dm/create/v2 [POST]
/**
 * Creates a DM with the members of the inputted uIds.
 * The user of the token passed in will be the owner of the DM.
 * @param {string} token User token
 * @param {number[]} uIds The users to be included in the DM
 * @returns {error}
 * @returns {dmId}
 */
export function dmCreateV2(token: string, uIds: number[]): { dmId: number } {
  const owner = findToken(token);

  // Error checking
  if (owner === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  const missingId = uIds.find((uId: number) => getUser(uId) === undefined);
  if (new Set(uIds).size !== uIds.length) {
    throw HTTPError(400, 'Array of uIds contains duplicates!');
  } else if (missingId !== undefined) {
    throw HTTPError(400, `No user of ID ${missingId} exists!`);
  }

  let data = getData();

  // Creates DM and pushes into dataStore
  const dm = makeNewDM(owner, uIds);
  data.dms.push(dm);

  const users = data.users.filter(user => uIds.includes(user.uId));
  for (const user of users) {
    data = notificationsPush(data, user, dm.dmId, false, `${owner.handleStr} added you to ${dm.name}`);
  }
  setData(data);

  // Updates user stats
  dmWorkspaceUpdate();

  for (const uId of uIds) {
    dmUserStatUpdate(uId);
  }

  return {
    dmId: dm.dmId
  };
}

// dmListV1 /dm/list/v2 [GET]
/**
 * Returns the list of DMs that the user is a member of.
 * @param {string} token User token
 * @returns {error}
 * @returns {dms}
 */
export function dmListV2(token: string): { dms: DmOutput[] } {
  const user = findToken(token);

  // Error checking
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  // Gets all DMs that the user is part of
  const list = getData().dms.filter((dm: DM) => dm.allMembers.includes(user.uId));

  return {
    dms: list.map((x: DmOutput) => ({
      dmId: x.dmId,
      name: x.name,
    }))
  };
}

// dmRemoveV1 /dm/remove/v2 [DELETE]
/**
 * Remove an existing DM, so all members are no longer in the DM.
 * @param {string} token User token
 * @param {number} dmId The DM to be removed
 * @returns {error}
 * @returns {}
 */
export function dmRemoveV2(token: string, dmId: number): Record<string, never> {
  const user = findToken(token);
  const dm = getDM(dmId);

  // Error checking
  if (dm === undefined) {
    throw HTTPError(400, `No DM of ${dmId} exists!`);
  } else if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (!dm.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of DM ${dmId}!`);
  } else if (dm.owner !== user.uId) {
    throw HTTPError(403, `User of ID ${user.uId} is not a the owner of DM ${dm.dmId}!`);
  }

  // Removes DM and pushes into dataStore
  const data = getData();
  const dms = data.dms;
  const index = dms.indexOf(dm);
  dms.splice(index, 1);
  data.dms = dms;
  setData(data);

  dmWorkspaceUpdate();
  for (const uId of dm.allMembers) {
    dmUserStatUpdate(uId);
  }
  return {};
}

// dmDetailsV1 /dm/details/v2 [GET]
/**
 * Given a DM with ID dmId that the authorised user is a member of, provide the name and members of the DM.
 * @param {string} token User token
 * @param {number} dmId ID of DM
 * @returns {error}
 * @returns {name, members}
 */
export function dmDetailsV2(token: string, dmId: number): { name: string, members: MemberOutput[] } {
  const data = getData();
  const user = findToken(token);
  const dm = getDM(dmId);
  const userData = data.users;
  // Error checking
  if (dm === undefined) {
    throw HTTPError(400, `No DM of ${dmId} exists!`);
  } else if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (!dm.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of DM ${dmId}!`);
  }
  // Gets DM name and members in DM and returns it out
  const name = dm.name;
  const allUsers = userData.filter((user: User) => { return dm.allMembers.includes(user.uId); });
  const members = allUsers.map((user: User) => {
    return {
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr,
      profileImgUrl: user.profileImgUrl
    };
  });
  return {
    name: name,
    members
  };
}

// dmLeaveV1 /dm/leave/v2 [POST]
/**
 * Given a DM ID, the user is removed as a member of this DM.
 * @param {string} token User token
 * @param {number} dmId ID of DM
 * @returns { error: string }
 * @returns {}
 */
export function dmLeaveV2(token: string, dmId: number): Record<string, never> {
  const user = findToken(token);
  const dm = getDM(dmId);

  // Error checking
  if (dm === undefined) {
    throw HTTPError(400, `No DM of ${dmId} exists!`);
  } else if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (!dm.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of DM ${dmId}!`);
  }
  // Removes the user from the member list of the DM and updates dataStore
  const index = dm.allMembers.indexOf(user.uId);
  dm.allMembers.splice(index, 1);

  const data = getData();
  const dms = data.dms;
  dms[dm.dmId] = dm;
  data.dms = dms;
  setData(data);

  dmWorkspaceUpdate();
  dmUserStatUpdate(user.uId);

  return {};
}

// dmMessagesV2 /dm/messages/v2 [GET]
/**
 * Given a channel with ID dmId that the authorised user is a member of,
 * return up to 50 messages between index "start" and "start + 50".11
 * @param {string} token User token
 * @param {number} dmId DM ID
 * @param {number} start Start index of messages to be returned
 * @returns {error}
 * @returns {messages, start, end}
 */
export function dmMessagesV2(token: string, dmId: number, start: number): { messages: Message[], start: number, end: number } {
  const user = findToken(token);
  const dm = getDM(dmId);

  // Error checking
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (dm === undefined) {
    throw HTTPError(400, `No DM of ${dmId} exists!`);
  } else if (!dm.allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of DM ${dmId}!`);
  } else if (start < 0) {
    throw HTTPError(400, 'Start index cannot be negative!');
  }

  const channelMessages = dm.messages;
  const numMessages = channelMessages.length;
  if (start > numMessages) {
    throw HTTPError(400, 'Start index for messages cannot be larger than the amount of messages in DM!');
  }
  const expectedEnd = start + 50;

  // Fetches up to 50 messages from start index
  const messages = channelMessages.slice(start, expectedEnd);
  const end = (expectedEnd < channelMessages.length) ? (expectedEnd) : -1;

  return { messages, start, end };
}
