import { Requests } from './requestsModule';
const requests = new Requests();
import { port, url } from '../config.json';
const SERVER_URL = `${url}:${port}`;

const serverUrls = {
  adminUserRemove: SERVER_URL + '/admin/user/remove/v1',
  adminUserpermissionChange: SERVER_URL + '/admin/userpermission/change/v1',
  authLogin: SERVER_URL + '/auth/login/v3',
  authRegister: SERVER_URL + '/auth/register/v3',
  authLogout: SERVER_URL + '/auth/logout/v2',
  authPasswordresetRequest: SERVER_URL + '/auth/passwordreset/request/v1',
  authPasswordresetReset: SERVER_URL + '/auth/passwordreset/reset/v1',
  channelsCreate: SERVER_URL + '/channels/create/v3',
  channelsList: SERVER_URL + '/channels/list/v3',
  channelsListAll: SERVER_URL + '/channels/listAll/v3',
  channelDetails: SERVER_URL + '/channel/details/v3',
  channelJoin: SERVER_URL + '/channel/join/v3',
  channelInvite: SERVER_URL + '/channel/invite/v3',
  channelMessages: SERVER_URL + '/channel/messages/v3',
  channelLeave: SERVER_URL + '/channel/leave/v2',
  channelAddowner: SERVER_URL + '/channel/addowner/v2',
  channelRemoveowner: SERVER_URL + '/channel/removeowner/v2',
  dmCreate: SERVER_URL + '/dm/create/v2',
  dmList: SERVER_URL + '/dm/list/v2',
  dmRemove: SERVER_URL + '/dm/remove/v2',
  dmDetails: SERVER_URL + '/dm/details/v2',
  dmLeave: SERVER_URL + '/dm/leave/v2',
  dmMessages: SERVER_URL + '/dm/messages/v2',
  messageSend: SERVER_URL + '/message/send/v2',
  messageSenddm: SERVER_URL + '/message/senddm/v2',
  messageEdit: SERVER_URL + '/message/edit/v2',
  messageRemove: SERVER_URL + '/message/remove/v2',
  messageShare: SERVER_URL + '/message/share/v1',
  messageReact: SERVER_URL + '/message/react/v1',
  messageUnreact: SERVER_URL + '/message/unreact/v1',
  messagePin: SERVER_URL + '/message/pin/v1',
  messageUnpin: SERVER_URL + '/message/unpin/v1',
  messageSendlater: SERVER_URL + '/message/sendlater/v1',
  messageSendlaterdm: SERVER_URL + '/message/sendlaterdm/v1',
  standupStart: SERVER_URL + '/standup/start/v1',
  standupActive: SERVER_URL + '/standup/active/v1',
  standupSend: SERVER_URL + '/standup/send/v1',
  userProfile: SERVER_URL + '/user/profile/v3',
  userProfileSetname: SERVER_URL + '/user/profile/setname/v2',
  userProfileSetemail: SERVER_URL + '/user/profile/setemail/v2',
  userProfileSethandle: SERVER_URL + '/user/profile/sethandle/v2',
  usersAll: SERVER_URL + '/users/all/v2',
  userProfileUploadphoto: SERVER_URL + '/user/profile/uploadphoto/v1',
  userStats: SERVER_URL + '/user/stats/v1',
  usersStats: SERVER_URL + '/users/stats/v1',
  notificationsGet: SERVER_URL + '/notifications/get/v1',
  search: SERVER_URL + '/search/v1',
  clear: SERVER_URL + '/clear/v1',
};

export function authLogin(email: string, password: string) {
  const reqUrl = serverUrls.authLogin;
  const data = { json: { email, password } };

  return requests.post(reqUrl, data);
}

export function authRegister(email: string, password: string, nameFirst: string, nameLast: string) {
  const reqUrl = serverUrls.authRegister;
  const data = { json: { email, password, nameFirst, nameLast } };

  return requests.post(reqUrl, data);
}

export function channelsCreate(token: string, name: string, isPublic: boolean) {
  const reqUrl = serverUrls.channelsCreate;
  const data = { json: { name, isPublic }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function channelsList(token: string) {
  const reqUrl = serverUrls.channelsList;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function channelsListAll(token: string) {
  const reqUrl = serverUrls.channelsListAll;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function channelDetails(token: string, channelId: number) {
  const reqUrl = serverUrls.channelDetails;
  const data = { qs: { channelId }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function channelJoin(token: string, channelId: number) {
  const reqUrl = serverUrls.channelJoin;
  const data = { json: { channelId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function channelInvite(token: string, channelId: number, uId: number) {
  const reqUrl = serverUrls.channelInvite;
  const data = { json: { channelId, uId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function channelMessages(token: string, channelId: number, start: number) {
  const reqUrl = serverUrls.channelMessages;
  const data = { qs: { channelId, start }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function userProfile(token: string, uId: number) {
  const reqUrl = serverUrls.userProfile;
  const data = { qs: { uId }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function clear() {
  const reqUrl = serverUrls.clear;
  const data = { qs: {} };

  return requests.delete(reqUrl, data);
}

export function authLogout(token: string) {
  const reqUrl = serverUrls.authLogout;
  const data = { headers: { token } };

  return requests.post(reqUrl, data);
}

export function channelLeave(token: string, channelId: number) {
  const reqUrl = serverUrls.channelLeave;
  const data = { json: { channelId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function channelAddowner(token: string, channelId: number, uId: number) {
  const reqUrl = serverUrls.channelAddowner;
  const data = { json: { channelId, uId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function channelRemoveowner(token: string, channelId: number, uId: number) {
  const reqUrl = serverUrls.channelRemoveowner;
  const data = { json: { channelId, uId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageSend(token: string, channelId: number, message: string) {
  const reqUrl = serverUrls.messageSend;
  const data = { json: { channelId, message }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageEdit(token: string, messageId: number, message: string) {
  const reqUrl = serverUrls.messageEdit;
  const data = { json: { messageId, message }, headers: { token } };

  return requests.put(reqUrl, data);
}

export function messageRemove(token: string, messageId: number) {
  const reqUrl = serverUrls.messageRemove;
  const data = { qs: { messageId }, headers: { token } };

  return requests.delete(reqUrl, data);
}

export function dmCreate(token: string, uIds: number[]) {
  const reqUrl = serverUrls.dmCreate;
  const data = { json: { uIds }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function dmList(token: string) {
  const reqUrl = serverUrls.dmList;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function dmRemove(token: string, dmId: number) {
  const reqUrl = serverUrls.dmRemove;
  const data = { qs: { dmId }, headers: { token } };

  return requests.delete(reqUrl, data);
}

export function dmDetails(token: string, dmId: number) {
  const reqUrl = serverUrls.dmDetails;
  const data = { qs: { dmId }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function dmLeave(token: string, dmId: number) {
  const reqUrl = serverUrls.dmLeave;
  const data = { json: { dmId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function dmMessages(token: string, dmId: number, start: number) {
  const reqUrl = serverUrls.dmMessages;
  const data = { qs: { dmId, start }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function messageSenddm(token: string, dmId: number, message: string) {
  const reqUrl = serverUrls.messageSenddm;
  const data = { json: { dmId, message }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function usersAll(token: string) {
  const reqUrl = serverUrls.usersAll;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function userProfileSetname(token: string, nameFirst: string, nameLast: string) {
  const reqUrl = serverUrls.userProfileSetname;
  const data = { json: { nameFirst, nameLast }, headers: { token } };

  return requests.put(reqUrl, data);
}

export function userProfileSetemail(token: string, email: string) {
  const reqUrl = serverUrls.userProfileSetemail;
  const data = { json: { email }, headers: { token } };

  return requests.put(reqUrl, data);
}

export function userProfileSethandle(token: string, handleStr: string) {
  const reqUrl = serverUrls.userProfileSethandle;
  const data = { json: { handleStr }, headers: { token } };

  return requests.put(reqUrl, data);
}

export function notificationsGet(token: string) {
  const reqUrl = serverUrls.notificationsGet;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function search(token: string, queryStr: string) {
  const reqUrl = serverUrls.search;
  const data = { qs: { queryStr }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function messageShare(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const reqUrl = serverUrls.messageShare;
  const data = { json: { ogMessageId, message, channelId, dmId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageReact(token: string, messageId: number, reactId: number) {
  const reqUrl = serverUrls.messageReact;
  const data = { json: { messageId, reactId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageUnreact(token: string, messageId: number, reactId: number) {
  const reqUrl = serverUrls.messageUnreact;
  const data = { json: { messageId, reactId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messagePin(token: string, messageId: number) {
  const reqUrl = serverUrls.messagePin;
  const data = { json: { messageId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageUnpin(token: string, messageId: number) {
  const reqUrl = serverUrls.messageUnpin;
  const data = { json: { messageId }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageSendlater(token: string, channelId: number, message: string, timeSent: number) {
  const reqUrl = serverUrls.messageSendlater;
  const data = { json: { channelId, message, timeSent }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function messageSendlaterdm(token: string, dmId: number, message: string, timeSent: number) {
  const reqUrl = serverUrls.messageSendlaterdm;
  const data = { json: { dmId, message, timeSent }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function standupStart(token: string, channelId: number, length: number) {
  const reqUrl = serverUrls.standupStart;
  const data = { json: { channelId, length }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function standupActive(token: string, channelId: number) {
  const reqUrl = serverUrls.standupActive;
  const data = { qs: { channelId }, headers: { token } };

  return requests.get(reqUrl, data);
}

export function standupSend(token: string, channelId: number, message: string) {
  const reqUrl = serverUrls.standupSend;
  const data = { json: { channelId, message }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function authPasswordresetRequest(email: string) {
  const reqUrl = serverUrls.authPasswordresetRequest;
  const data = { json: { email } };

  return requests.post(reqUrl, data);
}

export function authPasswordresetReset(resetCode: string, newPassword: string) {
  const reqUrl = serverUrls.authPasswordresetReset;
  const data = { json: { resetCode, newPassword } };

  return requests.post(reqUrl, data);
}

export function userProfileUploadphoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  const reqUrl = serverUrls.userProfileUploadphoto;
  const data = { json: { imgUrl, xStart, yStart, xEnd, yEnd }, headers: { token } };

  return requests.post(reqUrl, data);
}

export function userStats(token: string) {
  const reqUrl = serverUrls.userStats;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function usersStats(token: string) {
  const reqUrl = serverUrls.usersStats;
  const data = { headers: { token } };

  return requests.get(reqUrl, data);
}

export function adminUserRemove(token: string, uId: number) {
  const reqUrl = serverUrls.adminUserRemove;
  const data = { qs: { uId }, headers: { token } };

  return requests.delete(reqUrl, data);
}

export function adminUserpermissionChange(token: string, uId: number, permissionId: number) {
  const reqUrl = serverUrls.adminUserpermissionChange;
  const data = { json: { uId, permissionId }, headers: { token } };

  return requests.post(reqUrl, data);
}
