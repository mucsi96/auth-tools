import {
  Client,
  ClientSecretPost,
  processRefreshTokenResponse,
  refreshTokenGrantRequest
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
    ClientSecretPost(client.client_secret?.toString()!),
    refreshToken
  );

  const tokenResponse = await processRefreshTokenResponse(
    authorizationServer!,
    client,
    response
  );

  return {
    idToken: tokenResponse.id_token!,
    accessToken: tokenResponse.access_token,
    expiresIn: tokenResponse.expires_in!,
    refreshToken: tokenResponse.refresh_token!,
  };
}
