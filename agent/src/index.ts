import http, { IncomingMessage, ServerResponse } from 'http';
import { authorize, serverAuthorize } from './authorizationController.js';
import { getEnv, returnError } from './utils.js';
import { getToken } from './tokenController.js';
import { logout } from './logoutController.js';
import { handleCallback } from './callbackController.js';
import { getClientConfig } from './clientConfig.js';
import { AssertionError } from 'assert';

const PORT = process.env.PORT || 8080;
const BASE_PATH = getEnv('BASE_PATH');

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end('Health check passed!');
        return;
      }

      console.log(req.method, req.url);

      const client = getClientConfig();

      if (req.url === BASE_PATH + '/authorize' && req.method === 'POST') {
        return await authorize(client, req, res);
      }

      if (req.url === BASE_PATH + '/get-token' && req.method === 'POST') {
        return await getToken(client, req, res);
      }

      if (req.url === BASE_PATH + '/logout' && req.method === 'POST') {
        return await logout(client, req, res);
      }

      // These routes are for classic web authorization code flow
      if (req.url === BASE_PATH + '/authorize' && req.method === 'GET') {
        return await serverAuthorize(client, req, res);
      }

      if (req.url?.startsWith(BASE_PATH + '/callback') && req.method === 'GET') {
        return await handleCallback(client, req, res);
      }

      return returnError(res, 404, 'Route not found');
    } catch (e) {
      console.log((e as Error).stack);

      if (e instanceof AssertionError) {
        return returnError(res, 400, e.message);
      }

      return returnError(res, 500, 'Something went wrong');
    }
  }
);

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}. Basepath: ${BASE_PATH}`);
});

// Graceful shutdown on SIGTERM signal
process.on('SIGTERM', () => {
  console.info('Received SIGTERM signal. Closing server gracefully.');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});
