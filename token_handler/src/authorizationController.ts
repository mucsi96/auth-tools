import * as authorizeService from './authorizationService.js';

import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { generateCookieString, getBody } from './utils.js';
import assert from 'assert';

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

  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Set-Cookie': generateCookieString([
      { name: 'codeVerifier', value: codeVerifier, maxAge: 5 * 60 },
      { name: 'nonce', value: nonce, maxAge: 5 * 60 },
      { name: 'state', value: state, maxAge: 5 * 60 },
    ]),
  });
  res.write(JSON.stringify({ authorizationUrl }));
  res.end();
  return;
}
