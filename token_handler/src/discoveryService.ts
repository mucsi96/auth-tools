import { discoveryRequest, processDiscoveryResponse } from "oauth4webapi";
import { getEnv } from "./utils.js";

export async function discover() {
  const issuer = new URL(getEnv("IDENTITY_PROVIDER_BASE_PATH"));
  const authorizationServer = await processDiscoveryResponse(
    issuer,
    await discoveryRequest(issuer)
  );
  if (
    authorizationServer.code_challenge_methods_supported?.includes("S256") !==
    true
  ) {
    throw new Error("S256 PKCE is not supported");
  }

  return authorizationServer;
}
