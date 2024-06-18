import { generateKeyPairSync } from 'crypto';
import { IncomingMessage, ServerResponse, createServer } from 'http';
import { decode } from 'jsonwebtoken';
import {
  createAccessToken,
  createIdToken,
  createJWKS,
  getEnv,
  getQueryParams,
  getUrlEncodedBody,
} from './utils';
import assert from 'assert';

const PORT = 8080;
const KEY_ID = 'key1';
const authentication: Record<
  string,
  { scope: string; nonce: string; username?: string }
> = {};

const users: Record<string, { name: string; email: string; roles: string[] }> =
  {
    user1: {
      name: 'User One',
      email: 'user1@example.com',
      roles: ['Reader', 'Writer', 'Dashboard.Viewer'],
    },
    user2: {
      name: 'User Two',
      email: 'user2@example.com',
      roles: ['Reader'],
    },
  };

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem',
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem',
  },
});

const server = createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    const pathname = req.url?.split('?')[0];

    console.log(`${req.method} ${pathname}`);

    if (
      pathname ===
      `/${getEnv('TENANT_ID')}/v2.0/.well-known/openid-configuration`
    ) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          issuer: getEnv('ISSUER'),
          authorization_endpoint: `https://idp.auth-tools.home/${getEnv(
            'TENANT_ID'
          )}/v2.0/authorize`,
          token_endpoint: `${getEnv('ISSUER')}/token`,
          userinfo_endpoint: `${getEnv('ISSUER')}/userinfo`,
          jwks_uri: `${getEnv('ISSUER')}/jwks`,
          response_types_supported: ['code', 'id_token', 'token id_token'],
          subject_types_supported: ['public'],
          id_token_signing_alg_values_supported: ['RS256'],
        })
      );
    } else if (pathname === `/${getEnv('TENANT_ID')}/v2.0/authorize`) {
      const { redirect_uri, state, scope, nonce } = getQueryParams<{
        redirect_uri: string;
        state: string;
        scope: string;
        nonce: string;
      }>(req);

      authentication[state] = {
        scope,
        nonce,
      };
      // Simplified login form for demonstration
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
            <html>
                <body>
                    <h1>Login</h1>
                    <form method="POST" action="/login">
                        <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
                        <input type="hidden" name="state" value="${state}" />
                        <label for="username">Username:</label>
                        <input type="text" id="username" name="username" required />
                        <label for="password">Password:</label>
                        <input type="password" id="password" name="password" required />
                        <button type="submit">Login</button>
                    </form>
                </body>
            </html>
        `);
    } else if (pathname === '/login' && req.method === 'POST') {
      const { username, redirect_uri, state } = await getUrlEncodedBody<{
        username: string;
        redirect_uri: string;
        state: string;
      }>(req);

      const { nanoid } = await import('nanoid');
      const code = nanoid();
      authentication[state].username = username;
      authentication[code] = authentication[state];
      res.writeHead(302, {
        Location: `${redirect_uri}?code=${code}&state=${state}`,
      });
      res.end();
    } else if (pathname === `/${getEnv('TENANT_ID')}/v2.0/token`) {
      const { code } = await getUrlEncodedBody<{ code: string }>(req);
      const { scope, nonce, username } = authentication[code];

      assert(username, 'Missing username');

      const audience = scope
        .split(' ')
        .find((s) => s.includes('/'))
        ?.split('/')[0];

      assert(audience, 'Missing audience');

      const user = users[username];

      if (!user) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Invalid username');
        return;
      }

      const id_token = createIdToken({
        user: { ...user, nonce, sub: username },
        privateKey,
        keyid: KEY_ID,
      });
      const access_token = createAccessToken({
        user: { ...user, sub: username },
        scope,
        audience,
        privateKey,
        keyid: KEY_ID,
      });
      console.log('Access token:', decode(access_token));
      console.log('ID token:', decode(id_token));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          access_token,
          id_token,
          token_type: 'Bearer',
          expires_in: 3600,
        })
      );
    } else if (pathname === `/${getEnv('TENANT_ID')}/v2.0/jwks`) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(createJWKS({ publicKey, keyId: KEY_ID })));
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    }
  }
);

process.on('SIGINT', () => server.close(() => process.exit()));
process.on('SIGTERM', () => server.close(() => process.exit()));

server.listen(PORT, () => {
  console.log(`Mock OIDC provider running at http://localhost:${PORT}`);
});
