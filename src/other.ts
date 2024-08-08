// Function Imports
import { setData, Notification, Message, Data, User } from './dataStore';
import HTTPError from 'http-errors';
import { findToken } from './helpers';
import { channelMessagesV3 } from './channel';
import { dmListV2, dmMessagesV2 } from './dm';
import { channelsListV3 } from './channels';

// Return types:
type EmptySuccess = Record<string, never>;

// clearV1 /clear/v1 [DELETE]
/**
 * Clears all information stored in datastore.js
 * Uses setData function from datastore.js
 * @returns {}
 */
export function clearV1(): EmptySuccess {
  setData(
    {
      users: [],
      channels: [],
      dms: [],
      info: {
        userId: 0,
        channelId: 0,
        dmId: 0
      },
      resetCodes: [],
      globalOwners: [],
      userStats: [],
      workspaceStats: {
        channelsExist: [],
        dmsExist: [],
        messagesExist: []
      },
      standups: []
    }
  );

  return {};
}

// notificationsGetV1 /notifications/get/v1 [GET]
/**
 * Gets notifications for user
 * @param {string} token
 * @returns {Notification[]}
 */
export function notificationsGetV1(token: string): { notifications: Notification[] } {
  const user = findToken(token);
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  return { notifications: user.notifications.slice(0, 20) };
}

// searchV1 /searchv1 [GET]
/**
 * Returns messages that contains the query string
 * @param {string} token
 * @param {string} queryStr - string to search for
 * @returns {Message[]}
 */
export function searchV1(token: string, queryStr: string): { messages: Message[] } {
  const user = findToken(token);

  // Error checks
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (queryStr.length < 1) {
    throw HTTPError(400, 'Query string cannot be empty!');
  } else if (queryStr.length > 1000) {
    throw HTTPError(400, 'Query string cannot be over 1000 characters long!');
  }

  const channelsJoined = channelsListV3(token).channels;
  const dmsJoined = dmListV2(token).dms;

  // Finds all messages and adds them to array
  let allMessages: Message[] = [];
  channelsJoined.forEach(channel => {
    allMessages = allMessages.concat(getAllMessages(token, channel.channelId, queryStr, true));
  });
  dmsJoined.forEach(dm => {
    allMessages = allMessages.concat(getAllMessages(token, dm.dmId, queryStr, false));
  });

  return {
    messages: allMessages
  };
}

// Helper for notifications
/**
 * Adds notifications to array
 * @param {Data} data
 * @param {User} user
 * @param {number} id
 * @param {boolean} isChannel
 * @param {string} notificationMessage
 * @returns {Data}
 */
export function notificationsPush(data: Data, user: User, id: number, isChannel: boolean, notificationMessage: string) {
  const index = data.users.indexOf(user);
  user.notifications.unshift({
    channelId: isChannel ? id : -1,
    dmId: isChannel ? -1 : id,
    notificationMessage: notificationMessage
  });
  data.users[index] = user;
  return data;
}

// Gets all messages that matches the query string
/**
 * @param {string} token
 * @param {number} id
 * @param {string} queryStr
 * @param {boolean} isChannel
 * @returns {Message[]}
 */
function getAllMessages(token: string, id: number, queryStr: string, isChannel: boolean): Message[] {
  let messages: Message[] = [];
  let start = 0;
  while (start !== -1) {
    const currentChannelDmMessages = isChannel ? channelMessagesV3(token, id, start) : dmMessagesV2(token, id, start);
    const currentMessages = currentChannelDmMessages.messages.filter(message =>
      message.message.toLowerCase().includes(queryStr.toLowerCase()));
    messages = messages.concat(currentMessages);
    start = currentChannelDmMessages.end;
  }
  return messages;
}
