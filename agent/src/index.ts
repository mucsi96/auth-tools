import { AssertionError } from 'assert';
import http, { IncomingMessage, ServerResponse } from 'http';
import { authorize } from './authorizationController.js';
import { AuthorizationError } from './authorizationError.js';
import { handleCallback } from './callbackController.js';
import { getClientConfig } from './clientConfig.js';
import { logout } from './logoutController.js';
import { createCorsHeaders, getEnv, returnError } from './utils.js';

const PORT = process.env.PORT || 8080;
const BASE_PATH = getEnv('BASE_PATH');

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const pathname = req.url?.split('?')[0];

      if (pathname === '/health' && req.method === 'GET') {
        res.writeHead(200);
        res.end('Health check passed!');
        return;
      }

      console.log(req.method, pathname);

      const client = getClientConfig();

      if (req.method === 'OPTIONS') {
        res.writeHead(200, createCorsHeaders(req));
        res.end();
        return;
      }

      if (pathname === BASE_PATH + '/authorize' && req.method === 'GET') {
        return await authorize(client, req, res);
      }

      if (pathname === BASE_PATH + '/callback' && req.method === 'GET') {
        return await handleCallback(
          client,
          req,
          res
        );
      }

      if (pathname === BASE_PATH + '/logout' && req.method === 'POST') {
        return await logout(req, res);
      }

      return returnError(req, res, 404, 'Route not found');
    } catch (e) {
      console.log((e as Error).stack);

      if (e instanceof AssertionError) {
        return returnError(req, res, 400, e.message);
      }

      if (e instanceof AuthorizationError) {
        res.writeHead(403);
        res.end('Access denied');
        return;
      }

      return returnError(req, res, 500, 'Something went wrong');
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
