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
  assert(req.socket.remoteAddress, 'Missing remoteAddress');

  const { authorizationUrl } = await authorizeService.authorize({
    client,
    redirectUri,
    ip: req.socket.remoteAddress,
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

  const proto = req.headers['x-forwarded-proto'];
  const host = req.headers['x-forwarded-host'];
  const uri = req.headers['x-forwarded-uri'];
  const ip = req.headers['x-forwarded-for'];

  assert(proto, 'Missing x-forwarded-proto');
  assert(host, 'Missing x-forwarded-host');
  assert(uri, 'Missing x-forwarded-uri');
  assert(ip, 'Missing x-forwarded-for');

  const postAuthorizationRedirectUri = `${proto}://${host}${uri}`;

  if (await authorizeService.isAuthorized({ accessToken })) {
    res.writeHead(200);
    res.write('Authorized');
    res.end();
    return;
  }

  const { authorizationUrl } = await authorizeService.authorize({
    client,
    redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
    postAuthorizationRedirectUri,
    ip: ip.toString(),
  });

  res.writeHead(302, { Location: authorizationUrl });
  res.end();
}
