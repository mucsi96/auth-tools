import { discover } from './discoveryService.js';

export async function logout() {
  const { authorizationServer } = await discover();

  if (!authorizationServer.end_session_endpoint) {
    throw new Error('No end_session_endpoint found');
  }

  const response = await fetch(authorizationServer.end_session_endpoint);

  if (!response.ok) {
    throw new Error('Failed to end session');
  }
}
