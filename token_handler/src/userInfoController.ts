import * as userInfoService from './userInfoService.js';

import { IncomingMessage, ServerResponse } from 'http';
import { parseCookieString, returnError } from './utils.js';
import { Client } from 'oauth4webapi';
import assert from 'assert';

export async function getUserInfo(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { accessToken, subject } = parseCookieString<{
    accessToken: string;
    subject: string;
  }>(req.headers.cookie);

  // if (!oldRefreshToken) {
  //   return returnError(res, 401, "");
  // }

  // const { subject, accessToken, expiresIn, refreshToken } =
  //   await refreshTokenService.getFreshToken({
  //     refreshToken: oldRefreshToken,
  //   });

  // if (!expiresIn) {
  //   return returnError(res, 500, "Access token already expired");
  // }

  // if (!refreshToken) {
  //   return returnError(res, 500, "Refresh token is not returned");
  // }

  if (!accessToken || !subject) {
    return returnError(res, 401, '');
  }

  const userInfo = await userInfoService.getUserInfo({
    client,
    subject,
    accessToken,
  });

  res.writeHead(200, {
    'Content-Type': 'application/json',
    // "Set-Cookie": generateCookieString([
    //   {
    //     name: "accessToken",
    //     value: accessToken,
    //     maxAge: expiresIn,
    //   },
    //   {
    //     name: "refreshToken",
    //     value: refreshToken,
    //     maxAge: 7 * 24 * 60 * 60,
    //   },
    // ]),
  });
  res.write(JSON.stringify(userInfo));
  res.end();
  return;
}
