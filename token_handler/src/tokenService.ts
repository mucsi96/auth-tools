import {
  WWWAuthenticateChallenge,
  authorizationCodeGrantRequest,
  isOAuth2Error,
  parseWwwAuthenticateChallenges,
  processAuthorizationCodeOpenIDResponse,
  validateAuthResponse
} from "oauth4webapi";
import { client } from "./clientConfig.js";
import { discover } from "./discoveryService.js";

export async function getToken({
  codeVerifier,
  state,
  nonce,
  callbackUrl,
  redirectUri,
}: {
  codeVerifier: string;
  state: string;
  nonce: string;
  callbackUrl: string;
  redirectUri: string;
}) {
  const authorizationServer = await discover();

  const params = validateAuthResponse(
    authorizationServer!,
    client,
    new URL(callbackUrl),
    state!
  );

  if (isOAuth2Error(params)) {
    console.log("error", params);
    throw new Error("OAuth 2.0 redirect error");
  }

  const response = await authorizationCodeGrantRequest(
    authorizationServer!,
    client,
    params,
    redirectUri,
    codeVerifier!
  );

  let challenges: WWWAuthenticateChallenge[] | undefined;

  if ((challenges = parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log("challenge", challenge);
    }
    throw new Error("www-authenticate challenge");
  }

  const tokenResponse = await processAuthorizationCodeOpenIDResponse(
    authorizationServer!,
    client,
    response,
    nonce!
  );

  if (isOAuth2Error(tokenResponse)) {
    console.log("error", tokenResponse);
    throw new Error("OAuth 2.0 response body error");
  }

  return {
    accessToken: tokenResponse.access_token,
    expiresIn: tokenResponse.expires_in,
    refreshToken: tokenResponse.refresh_token,
  };
}
