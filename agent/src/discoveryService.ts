import { discoveryRequest, processDiscoveryResponse } from 'oauth4webapi';
import { getEnv } from './utils.js';

export async function discover() {
  const issuer = new URL(getEnv('ISSUER'));
  const authorizationServer = await processDiscoveryResponse(
    issuer,
    await discoveryRequest(issuer)
  );

  return authorizationServer;
}
