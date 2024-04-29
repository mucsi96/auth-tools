import {
  WWWAuthenticateChallenge,
  getValidatedIdTokenClaims,
  isOAuth2Error,
  parseWwwAuthenticateChallenges,
  processRefreshTokenResponse,
  refreshTokenGrantRequest,
} from "oauth4webapi";
import { client } from "./clientConfig.js";
import { discover } from "./discoveryService.js";

export async function getFreshToken({
  refreshToken,
}: {
  refreshToken: string;
}) {
  const authorizationServer = await discover();

  const response = await refreshTokenGrantRequest(
    authorizationServer,
    client,
    refreshToken
  );

  let challenges: WWWAuthenticateChallenge[] | undefined;

  if ((challenges = parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log("challenge", challenge);
    }
    throw new Error("www-authenticate challenge");
  }

  const tokenResponse = await processRefreshTokenResponse(
    authorizationServer!,
    client,
    response
  );

  if (isOAuth2Error(tokenResponse)) {
    console.log("error", tokenResponse);
    throw new Error("OAuth 2.0 response body error");
  }

  const { sub } = getValidatedIdTokenClaims(tokenResponse) ?? {};

  return {
    subject: sub!,
    accessToken: tokenResponse.access_token,
    expiresIn: tokenResponse.expires_in!,
    refreshToken: tokenResponse.refresh_token!,
  };
}
