import * as tokenService from "./tokenService.js";

import { IncomingMessage, ServerResponse } from "http";
import {
  generateCookieString,
  getBody,
  parseCookieString,
  returnError,
} from "./utils.js";

export async function getToken(req: IncomingMessage, res: ServerResponse) {
  const { callbackUrl, redirectUri } = await getBody<{
    callbackUrl?: string;
    redirectUri?: string;
  }>(req);
  const { codeVerifier, nonce, state } = parseCookieString<{
    codeVerifier: string;
    state: string;
    nonce: string;
  }>(req.headers.cookie);

  if (!callbackUrl) {
    return returnError(res, 400, "Missing callbackUrl");
  }

  if (!redirectUri) {
    return returnError(res, 400, "Missing redirectUri");
  }

  const { accessToken, expiresIn, refreshToken } =
    await tokenService.getToken({
      codeVerifier,
      state,
      nonce,
      callbackUrl,
      redirectUri,
    });

  if (!expiresIn) {
    return returnError(res, 500, "Access token already expired");
  }

  if (!refreshToken) {
    return returnError(res, 500, "Refresh token is not returned");
  }

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Set-Cookie": generateCookieString([
      { name: "codeVerifier", maxAge: 0 },
      { name: "nonce", maxAge: 0 },
      { name: "state", maxAge: 0 },
      { name: "accessToken", value: accessToken, maxAge: expiresIn },
      {
        name: "refreshToken",
        value: refreshToken,
        maxAge: 7 * 24 * 60 * 60,
      },
    ]),
  });
  res.end();
  return;
}
