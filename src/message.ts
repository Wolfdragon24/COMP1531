// enum Modes {
//   REMOVE = 'remove', 0
//   EDIT = 'edit', 1
//   PIN = 'pin', 2
//   UNPIN = 'unpin', 3
//   REACT = 'react', 4
//   UNREACT = 'unreact', 5
// } // eslint-disable-line no-eval
// Enum keeps coming up as unused variable

import HTTPError from 'http-errors';
import { DM, React, getData, Message, setData, User } from './dataStore';
import { findToken, generateMessageId } from './helpers';
import { notificationsPush } from './other';
import { messageUserStatUpdate, messageWorkspaceUpdate } from './stats';

// messageSendV2 /message/send/v2 [POST]
/**
 * Sends a message in the specified channel
 * @param {string} token - token
 * @param {number} channelId - id of channel
 * @param {string} message - message being sent
 * @returns {messageId}
 * @returns {{error}} on error
 */
export function messageSendV2(token: string, channelId: number, message: string): { messageId: number } {
  return messageSender(token, channelId, message, true);
}

// messageEditV2 /message/edit/v2 [PUT]
/**
 * Edits the specified message
 * @param {string} token - token
 * @param {number} messageId - id of message
 * @param {string} message - new message
 * @returns { }
 * @returns {{error}} on error
 */
export function messageEditV2(token: string, messageId: number, message: string): Record<string, never> {
  return messageChange(token, messageId, 1, message);
}

// messageRemoveV2 /message/remove/v2 [DELETE]
/**
 * Deletes the specified message
 * @param {string} token - token
 * @param {string} message - message being sent
 * @returns {messageId}
 * @returns {{error}} on error
 */
export function messageRemoveV2(token: string, messageId: number): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  }

  return messageChange(token, messageId, 0);
}

// messageSenddmV2 /message/senddm/v2 [POST]
/**
 * Sends a message in the specified DM
 * @param {string} token - token
 * @param {number} dmId - id of DM
 * @param {string} message - message being sent
 * @returns {messageId}
 * @returns {{error}} on error
 */
export function messageSenddmV2(token: string, dmId: number, message: string): { messageId: number } {
  return messageSender(token, dmId, message, false);
}

// messageShareV1 /message/share/v1 [POST]
/**
 * Sends a message in the specified DM
 * @param {string} token - token
 * @param {number} ogMessageId - id of original message
 * @param {string} message - message being added to original message
 * @param {number} dmId - id of DM || -1
 * @param {number} channelId - id of channel || -1
 * @returns {sharedMessageId}
 * @returns {{error}} on error
 */
export function messageShareV1(
  token: string, ogMessageId: number, message: string, channelId: number, dmId: number
): { sharedMessageId: number } {
  const result = messageChange(token, ogMessageId, 6);
  message += result;

  // Checks incoming message and ogMessageId
  // If no errors, send the message to correct channel
  if ((channelId === -1 && dmId === -1) || (channelId !== -1 && dmId !== -1)) {
    throw HTTPError(400, 'Invalid channelId and dmId!');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'Message length cannot be over 1000 characters!');
  } else if (channelId === -1) {
    return { sharedMessageId: messageSender(token, dmId, message, false, true).messageId };
  } else {
    return { sharedMessageId: messageSender(token, channelId, message, true, true).messageId };
  }
}

// messageReactV1 /message/react/v1 [POST]
/**
 * Adds a reaction to the specified message
 * @param {string} token - token
 * @param {number} messageId - id of message
 * @param {number} reactId - id of react being applied
 * @returns { }
 * @returns {{error}} on error
 */
export function messageReactV1(token: string, messageId: number, reactId: number): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  }

  return messageChange(token, messageId, 4, undefined, reactId);
}

// messageUnreactV1 /message/unreact/v1 [POST]
/**
 * Removes a reaction on the specified message
 * @param {string} token - token
 * @param {number} messageId - id of message
 * @param {number} reactId - id of react being removed
 * @returns { }
 * @returns {{error}} on error
 */
export function messageUnreactV1(token: string, messageId: number, reactId: number): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  }

  return messageChange(token, messageId, 5, undefined, reactId);
}

// messagePinV1 /message/pin/v1 [POST]
/**
 * Pins a specified message
 * @param {string} token - token
 * @param {number} messageId - id of message
 * @returns { }
 * @returns {{error}} on error
 */
export function messagePinV1(token: string, messageId: number): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  }

  return messageChange(token, messageId, 2);
}

// messageUnpinV1 /message/unpin/v1 [POST]
/**
 * Pins a specified message
 * @param {string} token - token
 * @param {number} messageId - id of message
 * @returns { }
 * @returns {{error}} on error
 */
export function messageUnpinV1(token: string, messageId: number): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Invalid token!');
  }

  return messageChange(token, messageId, 3);
}

// messageSendlaterV1 /message/sendlater/v1 [POST]
/**
 * Sends a message in the specified channel after specified time
 * @param {string} token - token
 * @param {number} dmId - id of DM
 * @param {string} message - message being sent
 * @param {number} timeSent - time to wait before sending
 * @returns {messageId}
 * @returns {{error}} on error
 */
export function messageSendlaterV1(
  token: string, channelId: number, message: string, timeSent: number
): { messageId: number } {
  return messageSender(token, channelId, message, true, false, timeSent);
}

// messageSendlaterdmV1 /message/sendlaterdm/v1 [POST]
/**
 * Sends a message in the specified DM after specified time
 * @param {string} token - token
 * @param {number} dmId - id of DM
 * @param {string} message - message being sent
 * @param {number} timeSent - time to wait before sending
 * @returns {messageId}
 * @returns {{error}} on error
 */
export function messageSendlaterdmV1(
  token: string, dmId: number, message: string, timeSent: number
): { messageId: number } {
  return messageSender(token, dmId, message, false, false, timeSent);
}

// Helper function for sending messages
/**
 * Performs checks on the message and then adds message to the correct place
 * in datastore. Returns messageId
 * @param {string} token
 * @param {number} id - id of message/DM
 * @param {string} message - message to be sent
 * @param {boolean} isChannel - is the specified destination a channel
 * @param {boolean} [share] - is it a shared message
 * @param {number} [timeSent] - time to wait before sending
 * @returns {error}
 * @returns {messageId}
 */
function messageSender(token: string, id: number, message: string, isChannel: boolean, share?: boolean, timeSent?: number): { messageId: number } {
  // Sets property types for dms/channels
  let property: string, idType: string;
  if (isChannel) {
    property = 'channels';
    idType = 'channelId';
  } else {
    property = 'dms';
    idType = 'dmId';
  }

  let data = getData();
  const index = data[property].findIndex((object: Record<string, any>) => { return object[idType] === id; });
  const user = findToken(token);

  // Error checking
  if (index === -1) {
    throw HTTPError(400, `No ${property} of ${id} exists!`);
  } else if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (message.length > 1000 && share === undefined) {
    throw HTTPError(400, 'Message length cannot be over 1000 characters!');
  } else if (message.length < 1) {
    throw HTTPError(400, 'Message cannot be empty!');
  } else if (!data[property][index].allMembers.includes(user.uId)) {
    throw HTTPError(403, `User of ID ${user.uId} is not a member of ${property} ${id}!`);
  }

  // Generated message object and pushes it to dataStore
  const messageId = generateMessageId(property, id);

  let timeToWait = 0;
  if (timeSent !== undefined) {
    timeToWait = timeSent - Math.floor(Date.now() / 1000);
    if (timeToWait < 0) {
      throw HTTPError(400, 'Cannot send messages in the past!');
    }
  }

  setTimeout(() => {
    data[property][index].messages.unshift(
      {
        messageId: messageId,
        uId: user.uId,
        message: message,
        timeSent: timeSent === undefined ? Math.floor(Date.now() / 1000) : timeSent,
        reacts: [],
        isPinned: false,
      }
    );

    // Pushing notifications
    const taggedUsers = parseTags(message);
    for (const user of taggedUsers) {
      data = notificationsPush(data, user, id, isChannel,
        `${user.handleStr} tagged you in ${data[property][index].name}: ${message.slice(0, 20)}`);
    }

    setData(data);

    // Updates statistics in the datastore
    messageUserStatUpdate(user.uId);
    messageWorkspaceUpdate();
  }, timeToWait * 1000);

  return { messageId };
}

// Helper function for changing message attributes (pins/reacts/edit/remove)
/**
 * Performs checks on messageId and message and applies specified change
 * @param {string} token
 * @param {number} messageId - message to be changed
 * @param {number} mode - specified action to be done to message
 * @param {string} [message] - new messafe if editing
 * @param {number} [reactId] - react to be added to message
 * @returns {}
 */
function messageChange(token: string, messageId: number, mode: number, message?: string, reactId?: number): Record<string, never> {
  // Checks message if not removing a message
  if (mode === 1) {
    if (message.length > 1000) {
      throw HTTPError(400, 'Message length cannot be over 1000 characters!');
    } else if (message.length < 1 && mode === 1) {
      mode = 0;
    }
  }

  let data = getData();
  const user = findToken(token);

  // Decode the channel/dm ID and sets property types
  const isChannel = parseInt(messageId.toString().slice(0, 1));
  const id = parseInt(messageId.toString().slice(1, 5));
  let property: string, ownerproperty: string, idType: string;
  if (isChannel === 4) {
    property = 'channels';
    ownerproperty = 'ownerMembers';
    idType = 'channelId';
  } else {
    property = 'dms';
    ownerproperty = 'owner';
    idType = 'dmId';
  }

  const index = data[property].findIndex((object: Message | DM) => { return object[idType] === id; });

  // Error checks
  if (index === -1) {
    throw HTTPError(400, 'MessageId is invalid!');
  } else if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if ((mode === 4 || mode === 5) && reactId !== 1) {
    throw HTTPError(400, 'ReactId is invalid!');
  }

  const owner = data[property][index][ownerproperty];
  const messageIndex = data[property][index].messages.findIndex((message: Message) => { return message.messageId === messageId; });

  // Checks if user is an owner
  let isOwner = false;
  if ([...owner].includes(user.uId)) {
    isOwner = true;
  }

  // Permission checks
  if (messageIndex === -1) {
    throw HTTPError(400, 'MessageId is invalid!');
  } else if (mode === 6) {
    return data[property][index].messages[messageIndex].message;
  } else if (!data[property][index].allMembers.includes(user.uId)) {
    throw HTTPError(403, 'User does not have permission to change this message!');
  }

  // Checks correct permission for pinning/editing/removing
  if (mode === 0 || mode === 1 || mode === 2 || mode === 3) {
    if (data[property][index].messages[messageIndex].uId !== user.uId && !isOwner) {
      throw HTTPError(403, 'User does not have permission to change this message!');
    }
  }

  // changes specified message
  if (mode === 0) {
    // Remove messages
    data[property][index].messages.splice(messageIndex, 1);
    setData(data);
    // Updates workspace stats
    messageWorkspaceUpdate();
    return {};
  } else if (mode === 1) {
    // Edits messages
    data[property][index].messages[messageIndex].message = message;

    // Pushing notifications
    const taggedUsers = parseTags(message);
    for (const user of taggedUsers) {
      data = notificationsPush(data, user, id, property === 'channels',
        `${user.handleStr} tagged you in ${data[property][index].name}: ${message.slice(0, 20)}`);
    }
    setData(data);
    return {};
  } else if (mode === 2) {
    // Pins messages
    if (data[property][index].messages[messageIndex].isPinned === true) {
      throw HTTPError(400, 'This message is already pinned!');
    } else {
      data[property][index].messages[messageIndex].isPinned = true;
      setData(data);
      return {};
    }
  } else if (mode === 3) {
    // Unpins messages
    if (data[property][index].messages[messageIndex].isPinned === false) {
      throw HTTPError(400, 'This message is not pinned!');
    } else {
      data[property][index].messages[messageIndex].isPinned = false;
      setData(data);
      return {};
    }
  } else if (mode === 4) {
    // React to message
    const reactIndex = data[property][index].messages[messageIndex].reacts.findIndex((react: React) => { return react.reactId === reactId; });

    // If react does not exist, make a new react objec, else add uid to react
    if (reactIndex === -1) {
      data[property][index].messages[messageIndex].reacts.push(
        {
          reactId: reactId,
          uIds: [user.uId],
          isThisUserReacted: false
        }
      );

      // Pushing notifications
      const notifiedUser = data.users.find(user => user.uId === data[property][index].messages[messageIndex].uId);
      if (data[property][index].allMembers.includes(notifiedUser.uId)) {
        data = notificationsPush(data, notifiedUser, id, property === 'channels',
          `${user.handleStr} reacted to your message in ${data[property][index].name}`);
      }
    } else {
      if (data[property][index].messages[messageIndex].reacts[reactIndex].uIds.includes(user.uId)) {
        throw HTTPError(400, 'You have already reacted to this message!');
      } else {
        data[property][index].messages[messageIndex].reacts[reactIndex].uIds.push(reactId);

        // Pushing notifications
        const notifiedUser = data.users.find(user => user.uId === data[property][index].messages[messageIndex].uId);
        if (data[property][index].allMembers.includes(notifiedUser.uId)) {
          data = notificationsPush(data, notifiedUser, id, property === 'channels',
            `${user.handleStr} reacted to your message in ${data[property][index].name}`);
        }
      }
    }
    setData(data);
    return {};
  } else {
    // Unreact to message (coverage was complaining about else if (mode === 5) so it has been replaced)
    const reactIndex = data[property][index].messages[messageIndex].reacts.findIndex((react: React) => { return react.reactId === reactId; });
    if (reactIndex === -1) {
      throw HTTPError(400, 'You have not reacted to this message!');
    } else {
      const uidIndex = data[property][index].messages[messageIndex].reacts[reactIndex].uIds.indexOf(user.uId);
      if (uidIndex === -1) {
        throw HTTPError(400, 'You have not reacted to this message!');
      } else {
        data[property][index].messages[messageIndex].reacts[reactIndex].uIds.splice(uidIndex, 1);
      }
    }
    setData(data);
    return {};
  }
}

// Helper function for detecting tags
/**
 * @param {string} message - message being sent
 * @returns {taggedUsers}
 */
function parseTags(message: string): Array<User> {
  const usersData = getData().users;
  const taggedUsers: Array<User> = [];
  const matches = message.match(/@[\w]+/);
  if (matches !== null) {
    matches.forEach(handleStr => {
      const user = usersData.find(user => handleStr.slice(1) === user.handleStr && !taggedUsers.includes(user));
      if (user !== undefined) {
        taggedUsers.push(user);
      }
    });
  }
  return taggedUsers;
}
