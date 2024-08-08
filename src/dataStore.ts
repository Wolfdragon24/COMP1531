// Return types:
export type Notification = {
  channelId: number,
  dmId: number,
  notificationMessage: string
};

export type User = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string,
  password: string,
  sessions: string[],
  notifications: Notification[],
  isRemoved: boolean
};

export type UserOutput = {
  uId: number,
  email: string,
  nameFirst: string,
  nameLast: string,
  handleStr: string,
  profileImgUrl: string
};

export type React = {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
};

export type Message = {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts: React[],
  isPinned: boolean
};

export type Channel = {
  channelId: number,
  name: string,
  public: boolean,
  ownerMembers: number[],
  allMembers: number[],
  messages: Message[]
};

export type DM = {
  dmId: number,
  name: string,
  owner: number,
  allMembers: number[],
  messages: Message[]
};

export type ResetCode = {
  uId: number,
  resetCode: string
};

export type UserStats = {
  uId: number,
  channelsJoined: {
    numChannelsJoined: number,
    timeStamp: number
  }[],
  dmsJoined: {
    numDmsJoined: number,
    timeStamp: number
  }[],
  messagesSent: {
    numMessagesSent: number,
    timeStamp: number
  }[],
};

export type WorkspaceStats = {
  channelsExist: {
    numChannelsExist: number,
    timeStamp: number
  }[],
  dmsExist: {
    numDmsExist: number,
    timeStamp: number
  }[],
  messagesExist: {
    numMessagesExist: number,
    timeStamp: number
  }[],
};

export type Standups = {
  channelId: number,
  buffer: string,
  timeFinish: number,
  userStart: number
}

export type Data = {
  users: User[],
  channels: Channel[],
  dms: DM[],
  info: {
    userId: number,
    channelId: number,
    dmId: number
  },
  resetCodes: ResetCode[],
  globalOwners: number[],
  userStats: UserStats[],
  workspaceStats: WorkspaceStats,
  standups: Standups[]
};

type StoredNames = { names: string[] };

// Constants for file IO
const DATAPATH = './data.json';
const fs = require('fs');

// Imports for functions
import { clearV1 } from './other';

const namesData: StoredNames = {
  names: [
    'tinachief', 'gamelopez', 'sonsweater', 'sweatsleep', 'sushispecial', 'validvisual',
    'plausiblemagic', 'mistersolid', 'littlebirdie', 'volcanodynasty', 'cynicalcable',
    'erosioneditor', 'supersilk', 'invicibleengine', 'lickvolleyball', 'chinafolio',
    'depdendentdrop', 'nicenadia', 'bruisewinter', 'veinlunchroom', 'streamprison',
    'ferrariflipper', 'stupendousletters', 'disillusionedarm', 'borderterritory',
    'printfaucet', 'applaudbridge', 'dripcoach', 'conceivehumor', 'unequaleduse'
  ]
};

let cache: Data;

// Reads all data on data.json file and returns data as an object
export function getData(): Data {
  if (cache === undefined) {
    const data = JSON.parse(fs.readFileSync(DATAPATH, 'utf-8'));
    cache = data;
  }
  return cache;
}

// Writes new data to data.json file
export function setData(newData: Data) {
  fs.writeFileSync(DATAPATH, JSON.stringify(newData, null, 2));
  cache = newData;
}

// Checks if a data.json file exists, if not it creates a new empty file
// with an empty datastore
export function fileCheck() {
  if (!fs.existsSync(DATAPATH)) {
    clearV1();
  }
}

// Gets a random name from an inputted index
export function getName(index: number): string {
  return namesData.names[index];
}

// Gets the length of the random names database
export function getNamesLength(): number {
  return namesData.names.length;
}
