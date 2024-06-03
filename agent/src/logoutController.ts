import * as logoutService from './logoutService.js';

import { IncomingMessage, ServerResponse } from 'http';
import {
  createCookieHeader,
  createCorsHeaders
} from './utils.js';

export async function logout(
  req: IncomingMessage,
  res: ServerResponse
) {
  await logoutService.logout();

  res.writeHead(200, {
    ...createCorsHeaders(req),
    'Content-Type': 'application/json',
    ...createCookieHeader([
      { name: 'idToken', maxAge: 0 },
      { name: 'accessToken', maxAge: 0, httpOnly: true },
      // { name: 'refreshToken', maxAge: 0, httpOnly: true },
    ]),
  });
  res.end();
  return;
}
