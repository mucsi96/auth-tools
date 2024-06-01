import * as authorizeService from './authorizationService.js';
import * as userInfoService from './userInfoService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { addPendingAuthorization } from './pendingAuthorizations.js';
import { getBody, getEnv } from './utils.js';

import { parseCookieString } from './utils.js';

export async function authorize(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { redirectUri } = await getBody<{
    redirectUri?: string;
  }>(req);

  assert(redirectUri, 'Missing redirectUri');

  const { authorizationUrl, codeVerifier, nonce, state } =
    await authorizeService.authorize({
      client,
      redirectUri,
    });

  addPendingAuthorization({
    authorizationUrl,
    codeVerifier,
    nonce,
    state,
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ authorizationUrl }));
  res.end();
  return;
}

export async function serverAuthorize(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { accessToken, subject } = parseCookieString<{
    accessToken: string;
    subject: string;
  }>(req.headers.cookie);
  try {
    assert(accessToken, 'Missing access token');
    assert(subject, 'Missing subject');

    console.log('Access token found, getting user info');
    await userInfoService.getUserInfo({
      client,
      subject,
      accessToken,
    });
    console.log('User info fetched');
  } catch (e) {
    const { authorizationUrl, codeVerifier, nonce, state } =
      await authorizeService.authorize({
        client,
        redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
      });

    addPendingAuthorization({
      authorizationUrl,
      codeVerifier,
      nonce,
      state,
    });

    res.writeHead(302, { Location: authorizationUrl });
    res.end();
    return;
  }

  res.writeHead(200);
  res.write('Authorized');
  res.end();
}
