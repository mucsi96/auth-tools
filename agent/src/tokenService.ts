import {
  Client,
  WWWAuthenticateChallenge,
  authorizationCodeGrantRequest,
  isOAuth2Error,
  parseWwwAuthenticateChallenges,
  processAuthorizationCodeOpenIDResponse,
  validateAuthResponse,
} from 'oauth4webapi';
import { discover } from './discoveryService.js';
import { getPendingAuthorization } from './pendingAuthorizations.js';

export async function getToken({
  client,
  callbackUrl,
  redirectUri,
}: {
  client: Client;
  callbackUrl: string;
  redirectUri: string;
}) {
  const authorizationServer = await discover();
  const callbackUrlObj = new URL(callbackUrl);

  const { state, codeVerifier, nonce } = getPendingAuthorization(
    callbackUrlObj.searchParams.get('state')
  );

  const params = validateAuthResponse(
    authorizationServer!,
    client,
    callbackUrlObj,
    state
  );

  if (isOAuth2Error(params)) {
    console.log('error', params);
    throw new Error('OAuth 2.0 redirect error');
  }

  const response = await authorizationCodeGrantRequest(
    authorizationServer!,
    client,
    params,
    redirectUri,
    codeVerifier
  );

  let challenges: WWWAuthenticateChallenge[] | undefined;

  if ((challenges = parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge);
    }
    throw new Error('www-authenticate challenge');
  }

  const tokenResponse = await processAuthorizationCodeOpenIDResponse(
    authorizationServer!,
    client,
    response,
    nonce
  );

  if (isOAuth2Error(tokenResponse)) {
    console.log('error', tokenResponse);
    throw new Error('OAuth 2.0 response body error');
  }

  return {
    accessToken: tokenResponse.access_token,
    idToken: tokenResponse.id_token,
    expiresIn: tokenResponse.expires_in,
    refreshToken: tokenResponse.refresh_token,
  };
}
