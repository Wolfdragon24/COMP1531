// Function Imports
import Mailjet from 'node-mailjet';
import * as dotenv from 'dotenv';
import { getData, setData, getName, getNamesLength } from './dataStore';
import { createHash } from 'crypto';
import { secretOgre } from './tokenSecrets.json';

// Return types:
import { User, Channel, DM } from './dataStore';

// Mailing Setup
dotenv.config();
const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_PUBLIC,
  process.env.MAILJET_SECRET
);

// listPullByKey
/**
 * Acquires an array of values from an array of objects using an inputted key
 * @param {Record<string, unknown>[]} list - list of objects
 * @param {string} key - key of the values wanted
 * @returns {any[]} output - list of requested values
 */
export function listPullByKey(list: Record<string, any>[], key: string): any[] {
  return list.map((item: Record<string, any>) => { return item[key]; });
}

// isUserMemberOfChannel
/**
 * Checks whether the user of authUserId is a member of the channel of channelId
 * @param {number} authUserId Valid user ID
 * @param {number} channelId Valid channel ID
 * @returns {boolean} true if user is a member of the channel, false if not
 */
export function isUserMemberOfChannel(authUserId: number, channelId: number): boolean {
  return getChannel(channelId).allMembers.includes(authUserId);
}

// getUser
/**
 * Gets the user with the inputted valid user ID
 * @param {number} uId Valid user ID
 * @returns {User} The user object
 */
export function getUser(uId: number): User {
  const user = getData().users.find((user: User) => user.uId === uId);
  if (!user || user.isRemoved === true) {
    return undefined;
  }

  return user;
}

// getChannel
/**
 * Gets the channel with the inputted valid channel ID
 * @param {number} channelId Valid channel ID
 * @returns {Channel} The channel object
 */
export function getChannel(channelId: number): Channel {
  return (getData().channels).find((channel: Channel) => { return channel.channelId === channelId; });
}

// getDM
/**
 * Gets the channel with the inputted valid DM ID
 * @param {number} dmId Valid DM ID
 * @returns {DM} The DM object
 */
export function getDM(dmId: number): DM {
  return (getData().dms).find((dm: DM) => { return dm.dmId === dmId; });
}

// isGlobalOwner
/**
 * If the input uId is a global member of the channel, isGlobalOwner
 * returns true.
 * @param {number} uId
 * @returns {boolean}
 */
export function isGlobalOwner(uId: number): boolean {
  const data = getData();

  return data.globalOwners.includes(uId);
}

// generateHandle
/**
 * Generates a handle
 * @param {string} nameFirst - First name
 * @param {string} nameLast - Last name
 * @param {User[]} usersData
 * @returns {string} handleStr
 */
export function generateHandle(nameFirst: string, nameLast: string, usersData: User[]): string {
  const handle = (nameFirst + nameLast).toLowerCase();
  let handleStr = handle.replace(/[^a-z0-9]/g, '');

  if (handleStr.length === 0) {
    const randomIndex = Math.round(Math.random() * getNamesLength() - 1);
    handleStr = getName(randomIndex);
  }

  if (handleStr.length > 20) {
    handleStr = handleStr.slice(0, 20);
  }

  // Checks for previous users with mirroring first and last names and
  // appends to the handle string where necessary
  const matchedHandle = usersData.filter((item: User) => { return (item.handleStr.startsWith(handleStr)); });

  const handlesNum = matchedHandle.length;

  if (handlesNum > 0) {
    handleStr += String(handlesNum - 1);
  }
  return handleStr;
}

// generateToken
/**
 * Generates a handle
 * @param {number} uId - User Id
 * @returns {string} token
 */
export function generateToken(uId: number): string {
  // Creates a string concatenating uId and current time
  const input = `${uId}${secretOgre}${Date.now()}`;

  return createHash('sha256').update(input).digest('base64');
}

// findToken
/**
 * Returns the user that is currently using the given token
 * @param {string} token - token
 * @returns {User}
 */
export function findToken(token: string): User {
  const users = getData().users;

  return users.find((user: User) => user.sessions.includes(token));
}

// makeNewDM
/**
 * Creates and returns a new DM with the specified owner and members
 * @param {User} owner The owner user
 * @param {number[]} uIds The members to be included in the DM
 * @returns { dmId, name, owner, allMembers, messages }
 */
export function makeNewDM(owner: User, uIds: number[]): DM {
  uIds.push(owner.uId);
  uIds.sort((a, b) => getUser(a).handleStr <= getUser(b).handleStr ? -1 : 1);

  const handleStrs = uIds.map(id => getUser(id).handleStr);
  const name = handleStrs.join(', ');

  const applicationData = getData();
  const dmId = applicationData.info.dmId++;
  setData(applicationData);

  return {
    dmId,
    name: name,
    owner: owner.uId,
    allMembers: uIds,
    messages: []
  };
}

// checkExistingHandle
/**
 * Searches through the datastore for an existing user that's using the given
 * handle string.
 * @param {string} handleStr - handle string
 * @returns {User}
 */
export function checkExistingHandle(handleStr: string): User {
  const users = getData().users;

  return users.find((user: User) => user.handleStr === handleStr);
}

// checkExistingEmail
/**
 * Searches through the datastore for an existing user that's using the given
 * email.
 * @param {string} email - handle string
 * @returns {User}
 */
export function checkExistingEmail(email: string): User {
  const users = getData().users;

  return users.find((user: User) => user.email === email);
}

// generateMessageId
/**
 * Generates a new messageId
 * @param {boolean} isChannel - if the message is for a channel or a dm
 * @param {number} id - id of channel / dm
 * @returns {number} - messageId
 */
export function generateMessageId(msgType: string, id: number): number {
  // Generates unique message ID
  const msgId = (Date.now() + Math.floor(Math.random() * 99999999)).toString().slice(2);

  // Combines the dm/channel information into the first 5 digits of the messageId
  // in order to locate the message for editing / removal
  const tempid = id.toString().padStart(4, '0');
  if (msgType === 'channels') {
    return parseInt('4' + tempid + msgId);
  } else {
    return parseInt('7' + tempid + msgId);
  }
}

// sendResetEmail
/**
 * Sends a reset email to the specified email
 * @param {User} user - user's password to get reset
 * @param {string} resetCode
 */
export function sendResetEmail(user: User, resetCode: string) {
  mailjet.post('send', { version: 'v3.1' }).request({
    Messages: [
      {
        From: {
          Email: 'boostedgroup@outlook.com',
          Name: 'UNSW Beans'
        },
        To: [{
          Email: user.email,
          Name: `${user.nameFirst} ${user.nameLast}`
        }],
        Subject: 'UNSW Beans Reset Password Request',
        TextPart: `Hey ${user.nameFirst},\n\nForgotten your password? No worries, it happens to the best of us. Your reset code is '${resetCode}'. Since we don't really care about keeping your account safe and sound, this reset code will not expire... ever... :)\n\nIf this was not you, too bad, no one's gonna do anything about that... :)\n\nDefinitely Much Love,\nUNSW Beans - Boosted`,
      }
    ]
  });
}
