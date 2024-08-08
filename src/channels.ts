import HTTPError from 'http-errors';
import { getData, setData, Channel } from './dataStore';
import { findToken } from './helpers';
import { channelUserStatUpdate, channelWorkspaceUpdate } from './stats';

// Return types:
type ChannelOutput = { channelId: number, name: string };
type Channels = { channels: ChannelOutput[] };
type ChannelId = { channelId: number };

// channelsCreateV3 /channels/create/v3 [POST]
/**
 * Creates a channel with the provided name and public state given a valid token
 * @param {string} token
 * @param {string} name
 * @param {boolean} isPublic
 * @returns {channel}
 */
export function channelsCreateV3(token: string, name: string, isPublic: boolean): ChannelId {
  const applicationData = getData();
  const authUser = findToken(token);

  const channelId = applicationData.info.channelId++;

  // Parses validity of naming and token
  if (authUser === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  } else if (name.length > 20) {
    throw HTTPError(400, 'Channel name must be less than 20 characters!');
  } else if (name.length < 1) {
    throw HTTPError(400, 'Channel name must not be empty!');
  }

  // Creates a channel with relevant data and appends to dataStore
  applicationData.channels.push({
    channelId: channelId,
    name: name,
    public: isPublic,
    ownerMembers: [authUser.uId],
    allMembers: [authUser.uId],
    messages: [],
  });

  setData(applicationData);

  channelUserStatUpdate(authUser.uId);
  channelWorkspaceUpdate();

  // Return channelId
  return { channelId };
}

// channelsListV3 /channels/list/v3
/**
 * Outputs a list of channels which a user has access to, with details
 * @param {string} token
 * @returns {channels}
 */
export function channelsListV3(token: string): Channels {
  const applicationData = getData();
  const channelData = applicationData.channels;
  const authUser = findToken(token);

  // Verifying valid token
  if (authUser === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  // Fetch list of all channel objects with the authUser as a member
  const channels = channelData.filter(
    (x: Channel) => x.allMembers.includes(authUser.uId)
  );

  return {
    channels: channels.map((x: Channel) => ({
      channelId: x.channelId,
      name: x.name,
    }))
  };
}

// channelsListAllV3 /channels/listAll/v3 [GET]
/**
 * Outputs a list of all existent channels inclusive of private channels
 * @param {string} token
 * @returns {channels}
 */
export function channelsListAllV3(token: string): Channels {
  // Error checking
  if (findToken(token) === undefined) {
    throw HTTPError(403, 'Token is invalid!');
  }

  return {
    channels: getData().channels.map((x: Channel) => ({
      channelId: x.channelId,
      name: x.name,
    }))
  };
}
