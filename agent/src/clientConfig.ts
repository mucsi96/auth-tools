import { Client } from 'oauth4webapi';
import { getEnv } from './utils.js';

export function getClientConfig(): Client {
  return {
    client_id: getEnv('CLIENT_ID'),
    client_secret: getEnv('CLIENT_SECRET'),
  };
}
