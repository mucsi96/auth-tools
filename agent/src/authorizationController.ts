import * as authorizeService from './authorizationService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client } from 'oauth4webapi';
import { getEnv, getQueryParams, parseCookieString } from './utils.js';

export async function authorize(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  let ip = req.socket.remoteAddress;
  let { postAuthorizationRedirectUri, scopes, requiredRoles } = getQueryParams<{
    postAuthorizationRedirectUri?: string;
    scopes: string | string[];
    requiredRoles?: string | string[];
  }>(req);

  if (!postAuthorizationRedirectUri) {
    const { accessToken } = parseCookieString<{
      accessToken: string;
    }>(req.headers.cookie);

    if (
      await authorizeService.isAuthorized({
        accessToken,
        requiredScopes: Array.isArray(scopes) ? scopes : [scopes],
        requiredRoles:
          requiredRoles && Array.isArray(requiredRoles)
            ? requiredRoles
            : requiredRoles
            ? [requiredRoles]
            : [],
      })
    ) {
      res.writeHead(200);
      res.write('Authorized');
      res.end();
      return;
    }

    const proto = req.headers['x-forwarded-proto'];
    const host = req.headers['x-forwarded-host'];
    const uri = req.headers['x-forwarded-uri'];
    ip = req.headers['x-forwarded-for']?.toString();

    assert(proto, 'Missing x-forwarded-proto');
    assert(host, 'Missing x-forwarded-host');
    assert(uri, 'Missing x-forwarded-uri');

    postAuthorizationRedirectUri = `${proto}://${host}${uri}`;
  }

  assert(ip, 'Missing ip address');

  const { authorizationUrl } = await authorizeService.authorize({
    client,
    redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
    postAuthorizationRedirectUri,
    ip,
    scopes: Array.isArray(scopes) ? scopes : [scopes],
  });

  res.writeHead(302, { Location: authorizationUrl });
  res.end();
}
