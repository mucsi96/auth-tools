import * as authorizeService from "./authorizationService.js";

import { IncomingMessage, ServerResponse } from "http";
import { generateCookieString, getBody, returnError } from "./utils.js";

export async function authorize(req: IncomingMessage, res: ServerResponse) {
  const { redirectUri } = await getBody<{ redirectUri?: string }>(req);

  if (!redirectUri) {
    return returnError(res, 400, "Missing redirectUri");
  }

  const { authorizationUrl, codeVerifier, nonce, state } =
    await authorizeService.authorize({
      redirectUri,
    });
  res.writeHead(200, {
    "Content-Type": "application/json",
    "Set-Cookie": generateCookieString([
      { name: "codeVerifier", value: codeVerifier, maxAge: 5 * 60 },
      { name: "nonce", value: nonce, maxAge: 5 * 60 },
      { name: "state", value: state, maxAge: 5 * 60 },
    ]),
  });
  res.write(JSON.stringify({ authorizationUrl }));
  res.end();
  return;
}
