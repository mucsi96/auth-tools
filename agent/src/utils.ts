import { IncomingMessage, ServerResponse } from 'http';

export function getEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

export function getQueryParams<T>(req: IncomingMessage): T {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  return Object.fromEntries(url.searchParams.entries()) as T;
}

export function getBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        resolve(body ? JSON.parse(body) : {});
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function returnError(
  req: IncomingMessage,
  res: ServerResponse,
  statusCode: number,
  message: string
) {
  console.error(message);
  res.writeHead(statusCode, {
    ...createCorsHeaders(req),
    'Content-Type': 'application/json',
  });
  res.end(JSON.stringify({ message }));
}

export function createCookieHeader(
  cookies: {
    name: string;
    value?: string;
    maxAge: number;
    httpOnly?: boolean;
    sameSite?: boolean;
  }[]
): Record<string, string[]> {
  return {
    'Set-Cookie': cookies
      .map(({ name, value, maxAge, httpOnly, sameSite }) => {
        const cookieOptions = [
          httpOnly && 'HttpOnly',
          sameSite ? 'SameSite=Strict' : 'SameSite=None',
          'Secure',
          'Path=/',
          `Domain=${getEnv('COOKIE_DOMAIN')}`,
          `Max-Age=${maxAge}`,
        ].filter(Boolean);

        return `${name}=${
          value ? encodeURIComponent(value) : ''
        }; ${cookieOptions.join('; ')}`;
      })
      .filter(Boolean),
  };
}

export function parseCookieString<T>(cookieString?: string): T {
  if (!cookieString) return {} as T;

  return cookieString.split(`;`).reduce((acc, cookie) => {
    const [name, value] = cookie.split(`=`);
    try {
      return {
        ...acc,
        [decodeURIComponent(name.trim())]: decodeURIComponent(value.trim()),
      };
    } catch {
      return acc;
    }
  }, {}) as T;
}

export function createCorsHeaders(req: IncomingMessage): Record<string, string> {
  return req.headers.origin?.split('.').slice(-2).join('.') ===
    getEnv('PUBLIC_URL').split('.').slice(-2).join('.')
    ? {
        'Access-Control-Allow-Origin': req.headers.origin,
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      }
    : {};
}
