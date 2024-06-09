import { AuthorizationError } from "./authorizationError.js";

export type PendingAuthorization = {
  namespace: string;
  ip: string;
  codeVerifier: string;
  nonce: string;
  state: string;
  timestamp: number;
  postAuthorizationRedirectUri?: string;
};

const pendingAuthizations: PendingAuthorization[] = [];

export function addPendingAuthorization(
  pendingAuthorization: PendingAuthorization
): void {
  const timestamp = Math.floor(Date.now() / 1000);
  if (
    pendingAuthizations.some((authorization) => {
      return (
        timestamp - authorization.timestamp < 5 &&
        pendingAuthorization.ip === authorization.ip
      );
    })
  ) {
    throw new AuthorizationError('Rate limit reached for pending authorizations');
  }

  pendingAuthizations.push(pendingAuthorization);

  if (pendingAuthizations.length > 5) {
    pendingAuthizations.shift();
  }
}

export function getPendingAuthorization(
  state?: string | null
): PendingAuthorization {
  const pendingAuthization = pendingAuthizations.findLast(
    (pendingAuthorization) => pendingAuthorization.state === state
  );

  if (!pendingAuthization) {
    throw new Error('Pending authorization not found');
  }

  return pendingAuthization;
}
