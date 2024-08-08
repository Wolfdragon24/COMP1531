// Function Imports
import HTTPError from 'http-errors';
import validator from 'validator';
import { generateHandle, generateToken, listPullByKey, findToken, checkExistingEmail, sendResetEmail } from './helpers';
import { setData, getData, User, ResetCode, Notification } from './dataStore';
import { createHash } from 'crypto';
import { secretBee, secretPoke } from './tokenSecrets.json';

// Setup
const DEFAULT_PFP = 'http://compserver.ddns.net:3001/images/default74fa5327cc0f4e947789dd5e989a61a824.jpg';

// Type Declarations
type AuthPackage = {
  token: string,
  authUserId: number,
};

// authLoginV3 /auth/login/v3
/**
 * Allows a user to login, given valid details, returning authentication data
 * @param {string} email
 * @param {string} password
 * @returns {AuthPackage}
 */
export function authLoginV3(email: string, password: string): AuthPackage {
  const applicationData = getData();
  const usersData = applicationData.users;

  const foundUser = usersData.find((item: User) => item.email === email);
  const userIndex = usersData.indexOf(foundUser);

  if (foundUser === undefined) {
    throw HTTPError(400, 'Email does not belong to a user!');
  } else if (foundUser.password !== createHash('sha256').update(`${password}${secretBee}`).digest('base64')) {
    throw HTTPError(400, 'Password is incorrect!');
  }

  const token = generateToken(foundUser.uId);

  applicationData.users[userIndex].sessions.push(token);
  setData(applicationData);

  return { token, authUserId: foundUser.uId };
}

// authRegisterV3 auth/register/v3 [POST]
/**
 * Allows registration of a user, provided an email, password, and name which are valid,
 * returning the token and user Id of the registered user
 * @param {string} email
 * @param {string} password
 * @param {string} nameFirst
 * @param {string} nameLast
 * @returns {AuthPackage}
 */
export function authRegisterV3(
  email: string, password: string, nameFirst: string, nameLast: string
): AuthPackage {
  const applicationData = getData();
  const usersData = applicationData.users;
  const timeStamp = Math.floor(Date.now() / 1000);

  // Error checking
  if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email!');
  } else if (listPullByKey(usersData, 'email').includes(email)) {
    throw HTTPError(400, 'Email already exists!');
  } else if (password.length < 6) {
    throw HTTPError(400, 'Password needs to be 6 characters or more!');
  } else if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'Invalid first name!');
  } else if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Invalid last name!');
  }

  // Acquires the user id value for the new user
  const uId = applicationData.info.userId++;

  // Appends first user to the global users by default
  if (uId === 0) {
    applicationData.globalOwners.push(uId);

    // Prepares initial workspace stats at the time the first user is registered
    applicationData.workspaceStats.channelsExist.push({
      numChannelsExist: 0,
      timeStamp: timeStamp
    });

    applicationData.workspaceStats.dmsExist.push({
      numDmsExist: 0,
      timeStamp: timeStamp
    });

    applicationData.workspaceStats.messagesExist.push({
      numMessagesExist: 0,
      timeStamp: timeStamp
    });
  }

  // Constructs handle string and token for user
  const handleStr = generateHandle(nameFirst, nameLast, usersData);
  const userToken = generateToken(uId);

  // Sets profile image as default
  const profileImgUrl = DEFAULT_PFP;

  // Newly registered users are not removed members of beans
  const isRemoved = false;

  // Creates hash for password
  password = createHash('sha256').update(`${password}${secretBee}`).digest('base64');

  // Creates an object for a new user, and appends it to the dataStore
  const newUserData = {
    uId,
    email,
    nameFirst,
    nameLast,
    handleStr,
    password,
    sessions: [userToken],
    profileImgUrl,
    notifications: [] as Array<Notification>,
    isRemoved
  };

  applicationData.users.push(newUserData);

  // Prepares an object for the user's stats
  applicationData.userStats.push({
    uId: uId,
    channelsJoined: [{
      numChannelsJoined: 0,
      timeStamp: timeStamp
    }],
    dmsJoined: [{
      numDmsJoined: 0,
      timeStamp: timeStamp
    }],
    messagesSent: [{
      numMessagesSent: 0,
      timeStamp: timeStamp
    }],
  });

  setData(applicationData);

  return {
    token: userToken, authUserId: uId
  };
}

// authLogoutV2 /auth/logout/v2 [POST]
/**
 * Logs out the specific user and invalidates their token
 * @param {string} token
 * @returns {Record<string, never>}
 */
export function authLogoutV2(token: string): Record<string, never> {
  const foundUser = findToken(token);

  if (foundUser === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  const applicationData = getData();
  const usersData = applicationData.users;
  const userIndex = usersData.findIndex((user: User) => JSON.stringify(user) === JSON.stringify(foundUser));
  const tokenIndex = foundUser.sessions.indexOf(token);

  applicationData.users[userIndex].sessions.splice(tokenIndex, 1);

  setData(applicationData);

  return {};
}

// authPasswordresetRequestV1 /auth/passwordreset/request/v1 [POST]
/**
 * Allows users to send a reset code to the account linked to an inputted email
 * @param {string} email
 * @returns {Record<string, never>}
 */
export function authPasswordresetRequestV1(email: string): Record<string, never> {
  const foundUser = checkExistingEmail(email);

  if (foundUser !== undefined) {
    const applicationData = getData();
    const usersData = applicationData.users;

    const resetCode = createHash('sha256').update(`${email}${secretPoke}${Date.now()}`).digest('base64');
    const uId = foundUser.uId;

    const userIndex = usersData.findIndex((user: User) => JSON.stringify(user) === JSON.stringify(foundUser));
    applicationData.users[userIndex].sessions = [];

    applicationData.resetCodes.push({ uId, resetCode });

    sendResetEmail(foundUser, resetCode);

    setData(applicationData);
  }

  return {};
}

// authPasswordresetResetV1 /auth/passwordreset/reset/v1 [POST]
/**
 * Allows users to reset password given a valid reset code
 * @param {string} resetCode
 * @param {string} newPassword
 * @returns {Record<string, never>}
 */
export function authPasswordresetResetV1(
  resetCode: string, newPassword: string
): Record<string, never> {
  const applicationData = getData();
  const matchedIndex = applicationData.resetCodes.findIndex((codeSet: ResetCode) => codeSet.resetCode === resetCode);

  if (newPassword.length < 6) {
    throw HTTPError(400, 'Password needs to be more than 6 characters!');
  } else if (matchedIndex === -1) {
    throw HTTPError(400, 'Invalid reset code inputted!');
  }

  const userIndex = applicationData.users.findIndex((user: User) => user.uId === applicationData.resetCodes[matchedIndex].uId);

  applicationData.users[userIndex].password = createHash('sha256').update(`${newPassword}${secretBee}`).digest('base64');
  applicationData.resetCodes.splice(matchedIndex, 1);

  setData(applicationData);

  return {};
}
