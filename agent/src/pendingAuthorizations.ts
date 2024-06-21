export type PendingAuthorization = {
  namespace: string;
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
