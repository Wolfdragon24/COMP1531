auth.js - authRegisterV3 : When all characters of a user's first and last name
    are not alphabetical characters nor numeric values, a random nickname is 
    selected from a predetermined list and assigned to that user as their handle string

channel.ts - If given a starter index less than 0, channelMessagesV2 will return an error.

dm.ts - If given a starter index less than 0, dmMessagesV2 will return an error.

message.ts - messageEditV2 will silently error when an input is provided identical to the prior state.

users.ts - userProfileSetHandleV2, userProfileSetemailV2, and userProfileSetnameV2 will silently error when an input is provided identical to the prior state.
