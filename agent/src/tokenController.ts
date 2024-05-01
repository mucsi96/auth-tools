import * as tokenService from './tokenService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { generateCookieString, getBody, parseCookieString } from './utils.js';

export async function getToken(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { redirectUri, callbackUrl } = await getBody<{
    redirectUri: string;
    callbackUrl?: string;
  }>(req);
  const { codeVerifier, nonce, state } = parseCookieString<{
    codeVerifier: string;
    state: string;
    nonce: string;
  }>(req.headers.cookie);

  assert(redirectUri, 'Missing redirectUri');
  assert(callbackUrl, 'Missing callbackUrl');

  const { accessToken, expiresIn, refreshToken, subject } =
    await tokenService.getToken({
      client,
      codeVerifier,
      state,
      nonce,
      callbackUrl,
      redirectUri,
    });

  assert(expiresIn, 'Access token already expired');
  assert(refreshToken, 'Refresh token is not returned');

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': generateCookieString([
      { name: 'codeVerifier', maxAge: 0 },
      { name: 'nonce', maxAge: 0 },
      { name: 'state', maxAge: 0 },
      { name: 'accessToken', value: accessToken, maxAge: expiresIn },
      { name: 'subject', value: subject, maxAge: expiresIn },
      {
        name: 'refreshToken',
        value: refreshToken,
        maxAge: 7 * 24 * 60 * 60,
      },
    ]),
  });
  res.end();
  return;
}
