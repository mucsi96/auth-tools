import { createPublicKey } from 'crypto';
import { IncomingMessage } from 'http';
import { sign } from 'jsonwebtoken';

export function getEnv(name: string): string {
  const value = process.env[name];

  if (value === undefined) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

export function getQueryParams<T>(req: IncomingMessage): T {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const queryParams = url.searchParams;
  const result: Record<string, string | string[]> = {};

  queryParams.forEach((value, key) => {
    const existingValue = result[key];

    if (existingValue) {
      if (Array.isArray(existingValue)) {
        existingValue.push(value);
      } else {
        result[key] = [existingValue, value];
      }
    } else {
      result[key] = value;
    }
  });

  return result as T;
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

export function getUrlEncodedBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    try {
      let body = '';
      req.on('data', (chunk: Buffer) => {
        body += chunk.toString();
      });
      req.on('end', () => {
        const result: Record<string, string> = {};

        body.split('&').forEach((pair) => {
          const [key, value] = pair.split('=');
          result[key] = decodeURIComponent(value);
        });

        resolve(result as T);
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function createJWKS({
  publicKey,
  keyId,
}: {
  publicKey: string;
  keyId: string;
}) {
  const jwk = createPublicKey(publicKey).export({ format: 'jwk' });
  jwk.use = 'sig';
  jwk.kid = keyId;
  jwk.issuer = getEnv('ISSUER');
  return { keys: [jwk] };
}

export function createAccessToken({
  privateKey,
  user,
  audience,
  scope,
  keyid,
}: {
  privateKey: string;
  user: any;
  audience: string;
  scope: string;
  keyid: string;
}) {
  return sign(
    {
      ...user,
      scp: scope
        ?.split(' ')
        .filter((s) => s.includes('/'))
        .map((s) => s.split('/')[1])
        .join(' '),
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer: getEnv('ISSUER'),
      audience,
      expiresIn: '1h',
      keyid,
    }
  );
}

export function createIdToken({
  user,
  privateKey,
  keyid,
}: {
  user: any;
  privateKey: string;
  keyid: string;
}) {
  return sign(
    {
      ...user,
    },
    privateKey,
    {
      algorithm: 'RS256',
      issuer: getEnv('ISSUER'),
      audience: getEnv('CLIENT_ID'),
      expiresIn: '1h',
      keyid,
    }
  );
}
