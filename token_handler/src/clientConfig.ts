import assert from 'assert';
import { readFileSync } from 'fs';
import { Client } from 'oauth4webapi';
import { load as parseYaml } from 'js-yaml';

const clients = parseYaml(readFileSync('/config/clients.yml', 'utf8')) as {
  client_id: string;
  client_secret: string;
  redirect_uris: string[];
}[];

export function getClientConfig(referer?: string): Client {
  assert(referer, 'referer not provided');

  const client = clients.find((client) =>
    client.redirect_uris.some((uri) => uri.includes(new URL(referer).origin))
  );

  if (!client) {
    throw new Error(`Client not found for referer: ${referer}`);
  }

  return {
    ...client,
    token_endpoint_auth_method: 'client_secret_basic',
  };
}
