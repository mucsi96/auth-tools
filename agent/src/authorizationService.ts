import {
  Client,
  calculatePKCECodeChallenge,
  generateRandomCodeVerifier,
  generateRandomNonce,
  generateRandomState,
} from 'oauth4webapi';
import { discover } from './discoveryService.js';
import { addPendingAuthorization } from './pendingAuthorizations.js';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { getEnv } from './utils.js';

export async function isAuthorized({
  accessToken,
}: {
  accessToken: string;
}): Promise<boolean> {
  try {
    const authorizationServer = await discover();

    if (!authorizationServer.jwks_uri) {
      throw new Error('No JWKS URI discovered');
    }

    const jwks = createRemoteJWKSet(new URL(authorizationServer.jwks_uri));

    await jwtVerify(accessToken, jwks, {
      issuer: getEnv('ISSUER'),
      audience: getEnv('CLIENT_ID'),
    });
    return true;
  } catch (e) {
    console.error('JWT verification failed', e);
    return false;
  }
}

export async function authorize({
  client,
  redirectUri,
  ip,
  postAuthorizationRedirectUri,
}: {
  client: Client;
  redirectUri: string;
  ip: string;
  postAuthorizationRedirectUri?: string;
}) {
  const authorizationServer = await discover();

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
    `openid profile email offline_access ${client.client_id}/.default`
  );
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);

  addPendingAuthorization({
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
