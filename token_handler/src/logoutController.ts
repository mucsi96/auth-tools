import * as logoutService from "./logoutService.js";

import { IncomingMessage, ServerResponse } from "http";
import { generateCookieString, parseCookieString } from "./utils.js";

export async function logout(req: IncomingMessage, res: ServerResponse) {
  const { accessToken, refreshToken } = parseCookieString<{
    accessToken: string;
    refreshToken: string;
  }>(req.headers.cookie);

  await logoutService.logout({
    accessToken,
    refreshToken,
  });
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Set-Cookie": generateCookieString([
      { name: "subject", maxAge: 0 },
      { name: "accessToken", maxAge: 0 },
      { name: "refreshToken", maxAge: 0 },
    ]),
  });
  res.end();
  return;
}
