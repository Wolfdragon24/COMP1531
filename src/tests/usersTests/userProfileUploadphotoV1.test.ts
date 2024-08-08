import { register1 } from '../testsHelper';
import { userProfileUploadphoto, userProfile, clear } from '../requestsHelper';

const SUCCESS_CODE = 200;
const REQUEST_ERROR = 400;
const AUTH_ERROR = 403;

/**
 * Main Tests
 * - Successfully upload photo
 *
 * Error Tests
 * - File can't be retrieved from given URL
 * - Negative xStart input
 * - Negative yStart input
 * - xEnd input too large
 * - yEnd input too large
 * - xEnd less than xStart
 * - yEnd less than yStart
 * - Given crop bounds bigger than original image
 * - Invalid Token
 * - Url links to a webpage
 * - Url does not exist
 * - Invalid photo format (png)
 */

beforeEach(() => {
  clear();
});

describe('Main Tests', () => {
  test('Successfully Upload Photo', () => {
    const user = register1().data;
    const oldLink = userProfile(user.token, user.authUserId).data.user.profileImgUrl;

    const validUrl = 'http://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 0, 0, 100, 100);

    expect(result.data).toStrictEqual({});
    expect(result.code).toStrictEqual(SUCCESS_CODE);

    const updatedData = userProfile(user.token, user.authUserId).data.user;
    expect(updatedData.profileImgUrl).not.toStrictEqual(oldLink);
  });
});

describe('Error Tests', () => {
  test('Unable to retrive file', () => {
    const user = register1().data;

    const imgUrl = 'https://www.mms.com/en-gb/404?UTM_Source=AWIN%20&awc=3219_1668730005_1a32cc6babff4a49ede00cbedb38f3cd';

    const result = userProfileUploadphoto(user.token, imgUrl, 0, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Negative xStart Input', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, -10, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Negative yStart Input', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 0, -10, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('xEnd Input Too Large', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 0, 0, 1000 ** 1000, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('yEnd Input Too Large', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 0, 0, 10, 1000 ** 1000);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('xEnd Less Than xStart', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 20, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('yEnd Less Than yStart', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 0, 20, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid crop bounds', () => {
    const user = register1().data;

    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto(user.token, validUrl, 0, 0, 1000000, 10000000);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid Token', () => {
    const validUrl = 'https://www.google.com/logos/2011/henson11-hp.jpg';

    const result = userProfileUploadphoto('a', validUrl, 0, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(AUTH_ERROR);
  });

  test('URL Links To Non-Image Webpage', () => {
    const user = register1().data;

    const invalidUrl = 'https://www.google.com';

    const result = userProfileUploadphoto(user.token, invalidUrl, 0, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('URL Does Not Exist', () => {
    const user = register1().data;

    const invalidUrl = 'kjndknakdjn';

    const result = userProfileUploadphoto(user.token, invalidUrl, 0, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });

  test('Invalid Photo Format (PNG)', () => {
    const user = register1().data;

    const invalidUrl = 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_light_color_272x92dp.png';

    const result = userProfileUploadphoto(user.token, invalidUrl, 0, 0, 10, 10);
    expect(result.data.error).toStrictEqual({ message: expect.any(String) });
    expect(result.code).toStrictEqual(REQUEST_ERROR);
  });
});
