import { authRegister, authLogin, channelsCreate } from './requestsHelper';
import { GenericReqOutput } from './requestsModule';

export const user1 = {
  email: 'john@jdoe.com',
  password: 'unbelievablysecurepassword',
  nameFirst: 'John',
  nameLast: 'Doe'
};
export const user2 = {
  email: 'jane@jdoe.com',
  password: 'evenmoresecurepassword',
  nameFirst: 'Jane',
  nameLast: 'Doe'
};
export const user3 = {
  email: 'jam@jdoe.com',
  password: 'bestpasswordintheworld',
  nameFirst: 'Jam',
  nameLast: 'Doe'
};

export const publicChannel1 = {
  name: 'Channel A',
  isPublic: true
};
export const privChannel1 = {
  name: 'Channel B',
  isPublic: false
};
export const publicChannel2 = {
  name: 'Channel C',
  isPublic: true
};
export const privChannel2 = {
  name: 'Channel D',
  isPublic: false
};

export function register1(): GenericReqOutput {
  return authRegister(user1.email, user1.password, user1.nameFirst, user1.nameLast);
}

export function login1(): GenericReqOutput {
  return authLogin(user1.email, user1.password);
}

export function register2(): GenericReqOutput {
  return authRegister(user2.email, user2.password, user2.nameFirst, user2.nameLast);
}

export function login2(): GenericReqOutput {
  return authLogin(user2.email, user2.password);
}

export function register3(): GenericReqOutput {
  return authRegister(user3.email, user3.password, user3.nameFirst, user3.nameLast);
}

export function login3(): GenericReqOutput {
  return authLogin(user3.email, user3.password);
}

export function channelPublic1(token: string): GenericReqOutput {
  return channelsCreate(token, publicChannel1.name, publicChannel1.isPublic);
}

export function channelPrivate1(token: string): GenericReqOutput {
  return channelsCreate(token, privChannel1.name, privChannel1.isPublic);
}

export function channelPublic2(token: string): GenericReqOutput {
  return channelsCreate(token, publicChannel2.name, publicChannel2.isPublic);
}

export function channelPrivate2(token: string): GenericReqOutput {
  return channelsCreate(token, privChannel2.name, privChannel2.isPublic);
}
