import * as tokenService from './tokenService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { createCookieHeader, getEnv } from './utils.js';
import { base64url } from 'jose';

export async function handleCallback(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { accessToken, expiresIn, postAuthorizationRedirectUri, claims } =
    await tokenService.getToken({
      client,
      callbackUrl: `${getEnv('PUBLIC_URL')}${req.url}`,
      redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
    });

  assert(expiresIn, 'Access token already expired');
  // assert(refreshToken, 'Refresh token is not returned');
  assert(postAuthorizationRedirectUri, 'Missing postAuthorizationRedirectUri');

  res.writeHead(302, {
    Location: postAuthorizationRedirectUri,
    ...createCookieHeader([
      {
        name: 'accessToken',
        value: accessToken,
        maxAge: expiresIn,
        httpOnly: true,
        sameSite: true,
      },
      // { name: 'idToken', value: idToken, maxAge: expiresIn, sameSite: true },
      {
        name: 'tokenClaims',
        value: base64url.encode(JSON.stringify(claims)),
        maxAge: expiresIn,
        sameSite: true,
      },
      // {
      //   name: 'refreshToken',
      //   value: refreshToken,
      //   maxAge: 7 * 24 * 60 * 60,
      //   httpOnly: true,
      // },
    ]),
  });
  res.end();
}
