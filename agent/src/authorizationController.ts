import * as authorizeService from './authorizationService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { getBody, getEnv, parseCookieString } from './utils.js';

export async function authorize(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { redirectUri } = await getBody<{
    redirectUri?: string;
  }>(req);

  assert(redirectUri, 'Missing redirectUri');

  const { authorizationUrl } = await authorizeService.authorize({
    client,
    redirectUri,
  });

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.write(JSON.stringify({ authorizationUrl }));
  res.end();
}

export async function serverAuthorize(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  const { accessToken } = parseCookieString<{
    accessToken: string;
  }>(req.headers.cookie);

  if (await authorizeService.isAuthorized({ accessToken })) {
    res.writeHead(200);
    res.write('Authorized');
    res.end();
    return;
  }

  const { authorizationUrl } = await authorizeService.authorize({
    client,
    redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
  });

  res.writeHead(302, { Location: authorizationUrl });
  res.end();
}
