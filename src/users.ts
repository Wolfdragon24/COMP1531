import HTTPError from 'http-errors';
import { findToken, checkExistingEmail, checkExistingHandle, getUser } from './helpers';
import { UserOutput, User, getData, setData } from './dataStore';
import validator from 'validator';
import request from 'sync-request';
import fs from 'fs';
import config from './config.json';
import imageSize from 'image-size';
import sharp from 'sharp';
import path from 'path';

const PORT: number = parseInt(process.env.PORT || config.port);
const HOST: string = process.env.IP || 'http://compserver.ddns.net';

// userProfileV3 /user/profile/v3 [GET]
/**
 * Returns details about a user given a valid token and uId of a user
 * @param {string} token
 * @param {number} uId
 * @returns {user}
 */
export function userProfileV3(token: string, uId: number): {user: UserOutput} {
  // NOTE: helper function getUser not called because userProfile is still valid for removed users.
  const fetchedUser = getData().users.find((x: User) => x.uId === uId);

  // Error checking:
  if (findToken(token) === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (fetchedUser === undefined) {
    throw HTTPError(400, `No user of ID ${uId} exists!`);
  }

  return {
    user: {
      uId: fetchedUser.uId,
      email: fetchedUser.email,
      nameFirst: fetchedUser.nameFirst,
      nameLast: fetchedUser.nameLast,
      handleStr: fetchedUser.handleStr,
      profileImgUrl: fetchedUser.profileImgUrl
    }
  };
}

// usersAllV2 /users/all/v2 [GET]
/**
 * Returns a list of all users and their associated details.
 * @param {string} token - token
 * @returns {users} - array of users
 */
export function usersAllV2(token: string): {users: Array<UserOutput>} {
  // Error checking:
  if (findToken(token) === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  // Filters out removed users
  const validUsers = getData().users.filter((x: User) => x.isRemoved === false);

  return {
    users: validUsers.map((x: User) => ({
      uId: x.uId,
      email: x.email,
      nameFirst: x.nameFirst,
      nameLast: x.nameLast,
      handleStr: x.handleStr,
      profileImgUrl: x.profileImgUrl
    }))
  };
}

// userProfileSetnameV2 /user/profile/setname/v1 [PUT]
/**
 * Update the authorised user's first and last name.
 * @param {string} token - token
 * @param {string} nameFirst - user first name
 * @param {string} nameLast - user last name
 * @returns {}
 */
export function userProfileSetnameV2(token: string, nameFirst: string, nameLast: string): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (user.nameFirst === nameFirst && user.nameLast === nameLast) {
    return {};
  } else if (nameFirst.length < 1 || nameFirst.length > 50) {
    throw HTTPError(400, 'Invalid first name!');
  } else if (nameLast.length < 1 || nameLast.length > 50) {
    throw HTTPError(400, 'Invalid last name!');
  }

  const data = getData();

  // Finds the user that wants to update their name
  const setNameUser = getUser(user.uId);
  setNameUser.nameFirst = nameFirst;
  setNameUser.nameLast = nameLast;

  // Saves updated data to datastore
  setData(data);

  return {};
}

// userProfileSetemailV2 /user/profile/setemail/v2 [PUT]
/**
 * Update the authorised user's email address.
 * @param {string} token - token
 * @param {string} email - user email
 * @returns {} on success
 */
export function userProfileSetemailV2(token: string, email: string): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (user.email === email) {
    return {};
  } else if (checkExistingEmail(email)) {
    throw HTTPError(400, 'Email already exists!');
  } else if (!validator.isEmail(email)) {
    throw HTTPError(400, 'Invalid email!');
  }

  const data = getData();

  // Finds the user that wants to set their email and updates their email
  const setEmailUser = getUser(user.uId);
  setEmailUser.email = email;

  // Saves updated data to datastore
  setData(data);

  return {};
}

// userProfileSethandleV2 /user/profile/sethandle/v2 [PUT]
/**
 * Update the authorised user's handle (i.e. display name).
 * @param {string} token - token
 * @param {string} handleStr - handle string
 * @returns {}
 */
export function userProfileSethandleV2(token: string, handleStr: string): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (user.handleStr === handleStr) {
    return {};
  } else if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'Handle length must be between 3 and 20 characters!');
  } else if (!/^[a-zA-Z0-9]+$/.test(handleStr)) {
    throw HTTPError(400, 'Handle must only contain alphanumeric characters!');
  } else if (checkExistingHandle(handleStr)) {
    throw HTTPError(400, 'This handle is already taken!');
  }

  const data = getData();

  // Finds the user that wants to set their handle and updates their handle
  const setHandleUser = getUser(user.uId);
  setHandleUser.handleStr = handleStr;

  // Saves updated data to datastore
  setData(data);

  return {};
}

// userProfileUploadphotoV1 /user/profile/uploadphoto/v1 [POST]
/**
 * Given a URL of an image on the internet, crops the image according to given bounds
 * and saves it to the user's profile.
 * @param {string} token - user token
 * @param {number} imgUrl - image url
 * @param {number} xStart - cropping bound
 * @param {number} yStart - cropping bound
 * @param {number} xEnd - cropping bound
 * @param {number} yEnd - cropping bound
 * @returns {}
 */
export function userProfileUploadphotoV1(
  token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number
): Record<string, never> {
  const user = findToken(token);

  // Error checking:
  if (user === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (xEnd <= xStart || yEnd <= yStart) {
    throw HTTPError(400, 'Please enter valid cropping bounds!');
  } else if (xEnd < 0 || xStart < 0 || yEnd < 0 || yStart < 0) {
    throw HTTPError(400, 'Please enter valid cropping bounds!');
  } else if (!imgUrl.startsWith('http') && !imgUrl.startsWith('www')) {
    throw HTTPError(400, 'Invalid URL!');
  }

  // Creates a unique file name
  const timeStamp = Math.floor(Date.now() / 1000);
  const fileAddress = '/images/' + user.handleStr + timeStamp + '.jpg';
  const filename = path.join(__dirname, '..' + fileAddress);

  // Temporary file to store the original picture before it is processed
  const originalFile = path.join(__dirname, '../images/orig_' + user.handleStr + timeStamp + '.jpg');

  // Requests the contents from the url
  const res = request('GET', imgUrl);
  if (res.statusCode !== 200) {
    throw HTTPError(400, 'File can not be retrieved!');
  }

  // Checks that the saved content is a JPG image
  const contentType = res.headers['content-type'];
  if (contentType !== 'image/jpg' && contentType !== 'image/jpeg') {
    throw HTTPError(400, 'Image must be a jpg!');
  }

  // Stores the original photo temporarily
  const image = res.getBody();
  fs.writeFileSync(originalFile, image);

  // Checks if the image dimensions are in bound
  // Deletes original file if dimensions are invalid
  const dimensions = imageSize(originalFile);
  if (xEnd > dimensions.width || yEnd > dimensions.height) {
    fs.unlinkSync(originalFile);
    throw HTTPError(400, 'Crop not within image bounds!');
  }

  // Crops the photo and saves it to the proper filename
  // await
  sharp(originalFile)
    .extract({ width: xEnd - xStart, height: yEnd - yStart, left: xStart, top: yStart })
    .toFile(filename);

  // Updates user profile with new photo
  saveProfilePic(fileAddress, user.uId);

  return {};
}

// saveProfilePic
/**
 * Generates a unique link to the cropped profile pic and updates the user's profile with it
 * @param {string} filename - name of the cropped photo stored locally
 * @param {number} uId - user id of the user wanting to change their photo
 * @returns {}
 */
function saveProfilePic(fileAddress: string, uId: number): Record<string, never> {
  const data = getData();
  const user = getUser(uId);

  // Generates a link to the cropped image saved on the server
  const newUrl = `${HOST}:${PORT}` + fileAddress;

  user.profileImgUrl = newUrl;

  setData(data);

  return {};
}
