import {
  messageSend,
  messageRemove,
  messageEdit,
  clear,
  userProfile,
  dmCreate,
  dmDetails,
  messageReact,
  messageUnreact,
  channelInvite,
  channelLeave,
  notificationsGet,
  authRegister
} from '../requestsHelper';
import { register1, register2, channelPublic1 } from '../testsHelper';

/**
 * Test cases :
 * Success :
 * - Tagged
 * - Edited tagged message
 * - Removed tagged message
 *
 * - React to message
 * - Remove react to message
 *
 * - Invited to DM
 * - Invited to channel
 *
 * - Kicked out of channel
 * - Only 1 notification for multiple tags in same message
 *
 * Errors :
 * Invalid token
 */

beforeEach(() => {
  clear();
});

describe('notification Errors ', () => {
  test('invalid user token', () => {
    const user = register1().data;
    const notifs = notificationsGet(user.token + 'adskjdh');
    expect(notifs.data.error).toStrictEqual({ message: expect.any(String) });
    expect(notifs.code).toStrictEqual(403);
  });

  test('Tagging an invalid user', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    messageSend(user.token, channel.channelId, 'bruh ur actually trollin @3sdfyusf79s7ui');

    const notifs = notificationsGet(user.token);
    expect(notifs.data.notifications).toStrictEqual([]);
    expect(notifs.code).toStrictEqual(200);
  });
});

describe('notification Success ', () => {
  test('Tagged in message -> editing -> removing', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const userdata = userProfile(user.token, user.authUserId).data;
    const message = messageSend(user.token, channel.channelId, `shrek leaned in closer and whispered @${userdata.user.handleStr}`).data;
    const expectedNotifs = {
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `${userdata.user.handleStr} tagged you in Channel A: shrek leaned in clos`
        }
      ],
    };

    let notifs = notificationsGet(user.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);

    messageEdit(user.token, message.messageId, 'a new message with no tags ');
    notifs = notificationsGet(user.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);

    messageRemove(user.token, message.messageId);
    notifs = notificationsGet(user.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);
  });

  test('React to message', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const userdata = userProfile(user.token, user.authUserId).data;
    const message = messageSend(user.token, channel.channelId, 'lets do a react video on god sheeeeeeee').data;
    messageReact(user.token, message.messageId, 1);
    const expectedNotifs = {
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `${userdata.user.handleStr} reacted to your message in Channel A`
        }
      ],
    };

    let notifs = notificationsGet(user.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);

    messageUnreact(user.token, message.messageId, 1);
    notifs = notificationsGet(user.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);
  });

  test('Inviting to Dm and channel', () => {
    const user = register1().data;
    const user2 = register2().data;
    const channel = channelPublic1(user.token).data;
    const userdata = userProfile(user.token, user.authUserId).data;
    channelInvite(user.token, channel.channelId, user2.authUserId);
    const expectedNotifs = {
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `${userdata.user.handleStr} added you to Channel A`
        }
      ],
    };

    let notifs = notificationsGet(user2.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);

    const dm = dmCreate(user.token, [user2.authUserId]).data;
    const dmName = dmDetails(user.token, dm.dmId).data.name;

    expectedNotifs.notifications.unshift(
      {
        channelId: -1,
        dmId: dm.dmId,
        notificationMessage: `${userdata.user.handleStr} added you to ${dmName}`
      }
    );
    notifs = notificationsGet(user2.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);
  });

  test('React to message after leaving channel', () => {
    const user = register1().data;
    const user2 = register2().data;
    const user3 = authRegister('a@a.com', 'whatapassword', 'Rick', 'Astley').data;
    const channel = channelPublic1(user.token).data;
    const userdata = userProfile(user.token, user.authUserId).data;
    channelInvite(user.token, channel.channelId, user2.authUserId);
    channelInvite(user.token, channel.channelId, user3.authUserId);
    const message = messageSend(user2.token, channel.channelId, 'hehe lets make him leave after this message').data;

    const expectedNotifs = {
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `${userdata.user.handleStr} added you to Channel A`
        }
      ],
    };

    let notifs = notificationsGet(user2.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);

    channelLeave(user2.token, channel.channelId);

    messageReact(user.token, message.messageId, 1);
    messageReact(user3.token, message.messageId, 1);

    notifs = notificationsGet(user2.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);
  });

  test('Multiple tags in 1 message', () => {
    const user = register1().data;
    const channel = channelPublic1(user.token).data;
    const userdata = userProfile(user.token, user.authUserId).data;
    messageSend(user.token, channel.channelId, `lmao ur so bad stop bottom fragging @${userdata.user.handleStr} @${userdata.user.handleStr} @${userdata.user.handleStr}`);
    const expectedNotifs = {
      notifications: [
        {
          channelId: channel.channelId,
          dmId: -1,
          notificationMessage: `${userdata.user.handleStr} tagged you in Channel A: lmao ur so bad stop `
        }
      ],
    };

    const notifs = notificationsGet(user.token);
    expect(notifs.data).toStrictEqual(expectedNotifs);
    expect(notifs.code).toStrictEqual(200);
  });
});
