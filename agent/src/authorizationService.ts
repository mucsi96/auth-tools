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

    await jwtVerify(
      accessToken,
      createRemoteJWKSet(new URL(authorizationServer.jwks_uri))
    );
    return true;
  } catch (e) {
    return false;
  }
}

export async function authorize({
  client,
  redirectUri,
}: {
  client: Client;
  redirectUri: string;
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
    'openid profile email offline_access'
  );
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('nonce', nonce);

  addPendingAuthorization({
    authorizationUrl: authorizationUrl.toString(),
    codeVerifier,
    nonce,
    state,
  });

  return {
    authorizationUrl: authorizationUrl.toString(),
  };
}
