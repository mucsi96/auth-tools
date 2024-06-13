import * as logoutService from './logoutService.js';

import { IncomingMessage, ServerResponse } from 'http';
import {
  createCookieHeader,
  createCorsHeaders,
  getQueryParams,
} from './utils.js';
import { assert } from 'console';

export async function logout(req: IncomingMessage, res: ServerResponse) {
  let { namespace } = getQueryParams<{
    namespace: string;
  }>(req);

  assert(namespace, 'Missing namespace');

  await logoutService.logout();

  res.writeHead(200, {
    ...createCorsHeaders(req),
    'Content-Type': 'application/json',
    ...createCookieHeader(namespace, [
      { name: 'tokenClaims', maxAge: 0 },
      { name: 'accessToken', maxAge: 0, httpOnly: true },
      // { name: 'refreshToken', maxAge: 0, httpOnly: true },
    ]),
  });
  res.end();
  return;
}
