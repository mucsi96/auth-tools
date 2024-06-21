import * as authorizeService from './authorizationService.js';

import assert from 'assert';
import { IncomingMessage, ServerResponse } from 'http';
import { Client, generateRandomState } from 'oauth4webapi';
import {
  createCookieHeader,
  getEnv,
  getQueryParams,
  parseCookieString,
} from './utils.js';
import { AuthorizationError } from './authorizationError.js';

export async function authorize(
  client: Client,
  req: IncomingMessage,
  res: ServerResponse
) {
  let { postAuthorizationRedirectUri, scopes, requiredRoles, namespace } =
    getQueryParams<{
      namespace: string;
      postAuthorizationRedirectUri?: string;
      scopes: string | string[];
      requiredRoles?: string | string[];
    }>(req);
  const { sessionId } = parseCookieString<{ sessionId?: string }>(
    namespace,
    req.headers.cookie
  );

  assert(namespace, 'Missing namespace');
  assert(scopes, 'Missing scopes');

  if (!postAuthorizationRedirectUri) {
    const { accessToken } = parseCookieString<{
      accessToken: string;
    }>(namespace, req.headers.cookie);

    if (
      accessToken &&
      (await authorizeService.isAuthorized({
        accessToken,
        requiredScopes: (Array.isArray(scopes) ? scopes : [scopes]).map(
          (scope) => scope.split('/')[1] as string
        ),
        requiredRoles:
          requiredRoles && Array.isArray(requiredRoles)
            ? requiredRoles
            : requiredRoles
            ? [requiredRoles]
            : [],

        audience: (Array.isArray(scopes) ? scopes[0] : scopes).split('/')[0],
      }))
    ) {
      res.writeHead(200);
      res.write('Authorized');
      res.end();
      return;
    } else if (accessToken) {
      throw new AuthorizationError('Unauthorized');
    }

    const proto = req.headers['x-forwarded-proto'];
    const host = req.headers['x-forwarded-host'];
    const uri = req.headers['x-forwarded-uri'];

    assert(proto, 'Missing x-forwarded-proto');
    assert(host, 'Missing x-forwarded-host');
    assert(uri, 'Missing x-forwarded-uri');

    postAuthorizationRedirectUri = `${proto}://${host}${uri}`;
  }

  if (sessionId) {
    throw new AuthorizationError(
      'Rate limit reached for pending authorizations'
    );
  }

  const { authorizationUrl } = await authorizeService.authorize({
    namespace,
    client,
    redirectUri: `${getEnv('PUBLIC_URL')}/callback`,
    postAuthorizationRedirectUri,
    scopes: Array.isArray(scopes) ? scopes : [scopes],
  });

  res.writeHead(302, {
    Location: authorizationUrl,
    ...createCookieHeader(namespace, [
      {
        name: 'sessionId',
        value: generateRandomState(),
        maxAge: 10,
      },
    ]),
  });
  res.end();
}
