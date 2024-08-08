import HTTPError from 'http-errors';
import { findToken, getUser, isGlobalOwner } from './helpers';
import { User, getData, setData } from './dataStore';

// adminUserRemoveV1 admin/user/remove/v1 [DELETE]
/**
 * Given a user by their uId, removes them from the Beans.
 * @param {string} token
 * @param {number} uId
 * @returns {}
 */
export function adminUserRemoveV1(token: string, uId: number): Record<string, never> {
  const data = getData();
  const authUser = findToken(token);
  const user = getUser(uId);
  const globalOwners = data.globalOwners;

  // Error checking:
  if (authUser === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (!isGlobalOwner(authUser.uId)) {
    throw HTTPError(403, 'Missing owner permissions!');
  } else if (user === undefined) {
    throw HTTPError(400, `No user of ID ${uId} exists!`);
  } else if (isGlobalOwner(uId) && globalOwners.length === 1) {
    throw HTTPError(400, `User ${uId} is the only global owner!`);
  }

  // If user being removed is a global owner, remove them as an owner
  if (isGlobalOwner(uId)) {
    const ownerIndex = globalOwners.indexOf(uId);
    globalOwners.splice(ownerIndex, 1);
  }

  // Sets user profile to be a removed user, changes all user's messages to 'Removed user'
  // and removes user from all of their joined dm/channels.
  removeUserProfile(uId);
  removeUserMessages(uId);
  removeUserChannelDms(uId);

  return {};
}

// adminUserpermissionChangeV1 admin/userpermission/change/v1 [POST]
/**
 * Given a user by their uID, sets their permissions to new permissions
 * described by permissionId.
 * @param {string} token
 * @param {number} uId
 * @param {number} permissionId
 * @returns {}
 */
export function adminUserpermissionChangeV1(token: string, uId: number,
  permissionId: number): Record<string, never> {
  const authUser = findToken(token);
  const user = getUser(uId);
  const data = getData();
  const globalOwners = data.globalOwners;

  // Error checking:
  if (authUser === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (!isGlobalOwner(authUser.uId)) {
    throw HTTPError(403, 'Missing owner permissions!');
  } else if (user === undefined) {
    throw HTTPError(400, `No user of ID ${uId} exists!`);
  } else if (permissionId !== 1 && permissionId !== 2) {
    throw HTTPError(400, 'Invalid permission id!');
  }

  if (permissionId === 1) {
    if (isGlobalOwner(uId)) {
      throw HTTPError(400, `User ${uId} is already an owner!`);
    }

    // Adds uId into the array of global owners
    globalOwners.push(uId);
  } else {
    if (isGlobalOwner(uId) && globalOwners.length === 1) {
      throw HTTPError(400, `User ${uId} is the only global owner!`);
    } else if (!isGlobalOwner(uId)) {
      throw HTTPError(400, `User ${uId} is already a member!`);
    }

    // Removes uId from the array of global owners
    const index = globalOwners.indexOf(uId);
    globalOwners.splice(index, 1);
  }

  setData(data);

  return {};
}

// removeUserProfile
/**
 * Sets the user profile matching the given uId to that of a default removed user's.
 * Also logs the user out of all active sessions.
 * @param {number} uId
 * @returns {Data}
 */
function removeUserProfile(uId: number): Record<string, never> {
  const data = getData();

  // Finds the user that is being removed
  const removedUser = data.users.find((x: User) => x.uId === uId);

  // Changes their profile to be that of a generic removed user's
  removedUser.nameFirst = 'Removed';
  removedUser.nameLast = 'User';
  removedUser.email = '';
  removedUser.handleStr = '';
  removedUser.isRemoved = true;
  removedUser.profileImgUrl = 'http://compserver.ddns.net:3001/images/removed.jpg';
  removedUser.sessions = [];

  setData(data);

  return {};
}

// removeUserMessages
/**
 * Finds all existing messages
 * @param {number} uId
 * @returns {}
 */
function removeUserMessages(uId: number): Record<string, never> {
  const data = getData();
  const channels = data.channels;
  const dms = data.dms;

  // Sets all messages sent by removed user to 'Removed user'
  for (const channel of channels) {
    // Loops through all channels
    const channelMessages = channel.messages;
    for (const message of channelMessages) {
      // Loops through all messages of the channel
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }

  for (const dm of dms) {
    // Loops through all dms
    const dmMessages = dm.messages;
    for (const message of dmMessages) {
      // Loops through all messages of the dm
      if (message.uId === uId) {
        message.message = 'Removed user';
      }
    }
  }

  setData(data);

  return {};
}

// removeUserChannelDms
/**
 * Removes the user from all of their current channels and dms.
 * @param {number} uId
 * @returns {}
 */
function removeUserChannelDms(uId: number): Record<string, never> {
  const data = getData();
  const channels = data.channels;
  const dms = data.dms;

  for (const channel of channels) {
    // Loops through all channels
    const channelAllMembers = channel.allMembers;
    for (const member of channelAllMembers) {
      // Loops through all channel member uIds
      if (member === uId) {
        // User is a member of this channel
        const memberIndex = channelAllMembers.indexOf(uId);
        const ownerIndex = channel.ownerMembers.indexOf(uId);

        if (ownerIndex !== -1) {
          // User is an owner of this channel
          // Removes user from owner members of the channel
          channel.ownerMembers.splice(ownerIndex, 1);
        }
        // Removes user from all members of the channel
        channelAllMembers.splice(memberIndex, 1);
      }
    }
  }

  for (const dm of dms) {
    // Loops through all dms
    const dmMembers = dm.allMembers;
    for (const member of dmMembers) {
      // Loops through all members of the dm
      if (member === uId) {
        // User is a member of this dm
        const memberIndex = dmMembers.indexOf(uId);
        // Removes user from all members of the dm
        dmMembers.splice(memberIndex, 1);
      }
    }
  }

  setData(data);

  return {};
}
