import { jwtVerify } from 'jose';
import {
  Client,
  calculatePKCECodeChallenge,
  generateRandomCodeVerifier,
  generateRandomNonce,
  generateRandomState,
} from 'oauth4webapi';
import { discover } from './discoveryService.js';
import { addPendingAuthorization } from './pendingAuthorizations.js';

export async function isAuthorized({
  accessToken,
  requiredScopes,
  requiredRoles,
}: {
  accessToken: string;
  requiredScopes: string[];
  requiredRoles: string[];
}): Promise<boolean> {
  try {
    const { jwks } = await discover();

    const { payload: claims } = await jwtVerify<{
      roles: string[];
      scp: string;
    }>(accessToken, jwks);

    return (
      requiredRoles.every((role) => claims.roles?.includes(role)) &&
      requiredScopes.every((scope) => claims.scp?.split(' ').includes(scope))
    );
  } catch (e) {
    console.error('JWT verification failed', e);
    return false;
  }
}

export async function authorize({
  namespace,
  client,
  redirectUri,
  ip,
  postAuthorizationRedirectUri,
  scopes,
}: {
  namespace: string;
  client: Client;
  redirectUri: string;
  ip: string;
  postAuthorizationRedirectUri?: string;
  scopes: string[];
}) {
  const { authorizationServer } = await discover();

  if (!authorizationServer.authorization_endpoint) {
    throw new Error('No uthorization endpoint discovered');
  }

  const codeVerifier = generateRandomCodeVerifier();
  const state = generateRandomState();
  const nonce = generateRandomNonce();
  const authorizationUrl = new URL(authorizationServer.authorization_endpoint);

  authorizationUrl.searchParams.set('client_id', client.client_id);
  authorizationUrl.searchParams.set(
    'code_challenge',
    await calculatePKCECodeChallenge(codeVerifier)
  );
  authorizationUrl.searchParams.set('code_challenge_method', 'S256');
  authorizationUrl.searchParams.set('redirect_uri', redirectUri);
  authorizationUrl.searchParams.set('response_type', 'code');
  authorizationUrl.searchParams.set(
    'scope',
    ['openid', 'profile', ...scopes].join(' ')
  );
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);

  addPendingAuthorization({
    namespace,
    codeVerifier,
    nonce,
    state,
    ip,
    timestamp: Math.floor(Date.now() / 1000),
    postAuthorizationRedirectUri,
  });

  return {
    authorizationUrl: authorizationUrl.toString(),
  };
}
