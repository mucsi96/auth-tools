import { createRemoteJWKSet } from 'jose';
import {
  allowInsecureRequests,
  AuthorizationServer,
  discoveryRequest,
  processDiscoveryResponse,
} from 'oauth4webapi';
import { getEnv } from './utils.js';

let authorizationServer: AuthorizationServer | undefined;
let jwks: ReturnType<typeof createRemoteJWKSet> | undefined;

export async function discover() {
  if (authorizationServer && jwks) {
    return {
      authorizationServer,
      jwks,
    };
  }

  const oidcBaseUrl = new URL(getEnv('ISSUER'));
  authorizationServer = await processDiscoveryResponse(
    oidcBaseUrl,
    await discoveryRequest(oidcBaseUrl, {
      [allowInsecureRequests]: getEnv('ALLOW_INSECURE_REQUESTS') === 'true',
    })
  );

  if (!authorizationServer.jwks_uri) {
    throw new Error('No JWKS URI discovered');
  }

  jwks = createRemoteJWKSet(new URL(authorizationServer.jwks_uri));

  return {
    authorizationServer,
    jwks,
  };
}
