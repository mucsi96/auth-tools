import * as tokenService from './tokenService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { generateCookieString, getEnv } from './utils.js';

export async function handleCallback(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { accessToken, expiresIn, refreshToken, idToken } =
    await tokenService.getToken({
      client,
      callbackUrl: `${getEnv('PUBLIC_URL')}${req.url}`,
      redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
    });

  assert(expiresIn, 'Access token already expired');
  assert(refreshToken, 'Refresh token is not returned');

  res.writeHead(200, {
    'Set-Cookie': generateCookieString([
      {
        name: 'accessToken',
        value: accessToken,
        maxAge: expiresIn,
        httpOnly: true,
      },
      { name: 'idToken', value: idToken, maxAge: expiresIn },
      {
        name: 'refreshToken',
        value: refreshToken,
        maxAge: 7 * 24 * 60 * 60,
        httpOnly: true,
      },
    ]),
  });
  res.write('Authorized');
  res.end();
}
