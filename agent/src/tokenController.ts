import * as tokenService from './tokenService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { generateCookieString, getBody } from './utils.js';

export async function getToken(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { redirectUri, callbackUrl } = await getBody<{
    redirectUri: string;
    callbackUrl?: string;
  }>(req);
  assert(redirectUri, 'Missing redirectUri');
  assert(callbackUrl, 'Missing callbackUrl');

  const { accessToken, expiresIn, refreshToken, subject } =
    await tokenService.getToken({
      client,
      callbackUrl,
      redirectUri,
    });

  assert(expiresIn, 'Access token already expired');
  assert(refreshToken, 'Refresh token is not returned');

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': generateCookieString([
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