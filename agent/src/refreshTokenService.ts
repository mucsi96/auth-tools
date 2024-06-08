import {
  Client,
  WWWAuthenticateChallenge,
  isOAuth2Error,
  parseWwwAuthenticateChallenges,
  processRefreshTokenResponse,
  refreshTokenGrantRequest,
} from 'oauth4webapi';
import { discover } from './discoveryService.js';

export async function getFreshToken({
  client,
  refreshToken,
}: {
  client: Client;
  refreshToken: string;
}) {
  const { authorizationServer } = await discover();

  const response = await refreshTokenGrantRequest(
    authorizationServer,
    client,
    refreshToken
  );

  let challenges: WWWAuthenticateChallenge[] | undefined;

  if ((challenges = parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log('challenge', challenge);
    }
    throw new Error('www-authenticate challenge');
  }

  const tokenResponse = await processRefreshTokenResponse(
    authorizationServer!,
    client,
    response
  );

  if (isOAuth2Error(tokenResponse)) {
    console.log('error', tokenResponse);
    throw new Error('OAuth 2.0 response body error');
  }

  return {
    idToken: tokenResponse.id_token!,
    accessToken: tokenResponse.access_token,
    expiresIn: tokenResponse.expires_in!,
    refreshToken: tokenResponse.refresh_token!,
  };
}
