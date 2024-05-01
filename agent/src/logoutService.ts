import {
  Client,
  processRevocationResponse,
  revocationRequest
} from "oauth4webapi";
import { discover } from "./discoveryService.js";

export async function logout({
  client,
  accessToken,
  refreshToken,
}: {
  client: Client;
  accessToken?: string;
  refreshToken?: string;
}) {
  const authorizationServer = await discover();

  if (!authorizationServer.authorization_endpoint) {
    throw new Error("No uthorization endpoint discovered");
  }

  if (accessToken) {
    const error = await processRevocationResponse(
      await revocationRequest(authorizationServer, client, accessToken)
    );

    if (error) {
      throw new Error("OAuth 2.0 response body error");
    }
  }

  if (refreshToken) {
    const error = await processRevocationResponse(
      await revocationRequest(authorizationServer, client, refreshToken)
    );

    if (error) {
      throw new Error("OAuth 2.0 response body error");
    }
  }
}
