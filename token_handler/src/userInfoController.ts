import * as userInfoService from "./userInfoService.js";
import * as refreshTokenService from "./refreshTokenService.js";

import { IncomingMessage, ServerResponse } from "http";
import {
  generateCookieString,
  parseCookieString,
  returnError,
} from "./utils.js";

export async function getUserInfo(req: IncomingMessage, res: ServerResponse) {
  const { refreshToken: oldRefreshToken } = parseCookieString<{
    refreshToken: string;
  }>(req.headers.cookie);

  if (!oldRefreshToken) {
    return returnError(res, 401, "");
  }

  const { subject, accessToken, expiresIn, refreshToken } =
    await refreshTokenService.getFreshToken({
      refreshToken: oldRefreshToken,
    });

  if (!expiresIn) {
    return returnError(res, 500, "Access token already expired");
  }

  if (!refreshToken) {
    return returnError(res, 500, "Refresh token is not returned");
  }

  const userInfo = await userInfoService.getUserInfo({ subject, accessToken });

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Set-Cookie": generateCookieString([
      {
        name: "accessToken",
        value: accessToken,
        maxAge: expiresIn,
      },
      {
        name: "refreshToken",
        value: refreshToken,
        maxAge: 7 * 24 * 60 * 60,
      },
    ]),
  });
  res.write(JSON.stringify(userInfo));
  res.end();
  return;
}
