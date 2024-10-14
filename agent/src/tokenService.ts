import { decodeJwt } from 'jose';
import {
  Client,
  ClientSecretPost,
  allowInsecureRequests,
  authorizationCodeGrantRequest,
  processAuthorizationCodeResponse,
  validateAuthResponse
} from 'oauth4webapi';
import { discover } from './discoveryService.js';
import { getPendingAuthorization } from './pendingAuthorizations.js';
import { getEnv } from './utils.js';

export async function getToken({
  client,
  callbackUrl,
  redirectUri,
}: {
  client: Client;
  callbackUrl: string;
  redirectUri: string;
}) {
  const { authorizationServer } = await discover();
  const callbackUrlObj = new URL(callbackUrl);

  const {
    namespace,
    state,
    codeVerifier,
    nonce,
    postAuthorizationRedirectUri,
  } = getPendingAuthorization(callbackUrlObj.searchParams.get('state'));

  const params = validateAuthResponse(
    authorizationServer!,
    client,
    callbackUrlObj,
    state
  );

  const response = await authorizationCodeGrantRequest(
    authorizationServer!,
    client,
    ClientSecretPost(client.client_secret?.toString()!),
    params,
    redirectUri,
    codeVerifier,
    { [allowInsecureRequests]: getEnv('ALLOW_INSECURE_REQUESTS') === 'true',}
  );

  const tokenResponse = await processAuthorizationCodeResponse(
    authorizationServer!,
    client,
    response,
    { expectedNonce: nonce, requireIdToken: true }
  );

  const { name, email, roles, preferred_username } = await decodeJwt<{
    name: string;
    email: string;
    roles: string[];
    preferred_username: string;
  }>(tokenResponse.access_token);

  return {
    namespace,
    accessToken: tokenResponse.access_token,
    idToken: tokenResponse.id_token,
    expiresIn: tokenResponse.expires_in,
    refreshToken: tokenResponse.refresh_token,
    postAuthorizationRedirectUri,
    claims: { name, email, roles, preferred_username },
  };
}
