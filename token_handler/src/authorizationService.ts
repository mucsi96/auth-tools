import {
  calculatePKCECodeChallenge,
  generateRandomCodeVerifier,
  generateRandomNonce,
  generateRandomState
} from "oauth4webapi";
import { client } from "./clientConfig.js";
import { discover } from "./discoveryService.js";

export async function authorize({ redirectUri }: { redirectUri: string }) {
  const authorizationServer = await discover();

  if (!authorizationServer.authorization_endpoint) {
    throw new Error("No uthorization endpoint discovered");
  }

  const codeVerifier = generateRandomCodeVerifier();
  const state = generateRandomState();
  const nonce = generateRandomNonce();
  const authorizationUrl = new URL(authorizationServer.authorization_endpoint);

  authorizationUrl.searchParams.set("client_id", client.client_id);
  authorizationUrl.searchParams.set(
    "code_challenge",
    await calculatePKCECodeChallenge(codeVerifier)
  );
  authorizationUrl.searchParams.set("code_challenge_method", "S256");
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("scope", "openid offline_access groups profile email");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);

  return {
    codeVerifier,
    state,
    nonce,
    authorizationUrl: authorizationUrl.toString(),
  };
}
