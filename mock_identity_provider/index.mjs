import { createServer, get } from "http";
import { parse } from "url";
import { parse as _parse } from "querystring";
import { generateKeyPairSync, createPublicKey } from "crypto";
import jsonwebtoken from "jsonwebtoken";
import { nanoid } from "nanoid";

const { sign, verify, decode } = jsonwebtoken;
const PORT = 8080;
const KEY_ID = "key1";

const authentication = {};

// Mock user data
const users = {
  user1: {
    sub: "user1",
    name: "User One",
    email: "user1@example.com",
    roles: ["Reader", "Writer", "Dashboard.Viewer"],
  },
  user2: {
    sub: "user2",
    name: "User Two",
    email: "user2@example.com",
    roles: ["Reader"],
  },
};

// Generate RSA key pair
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
  },
});

function createAccessToken({ user, audience, scope }) {
  return sign(
    {
      ...user,
      scp: scope
        ?.split(" ")
        .filter((s) => s.includes("/"))
        .map((s) => s.split("/")[1])
        .join(" "),
    },
    privateKey,
    {
      algorithm: "RS256",
      issuer: getEnv("ISSUER"),
      audience,
      expiresIn: "1h",
      keyid: KEY_ID,
    }
  );
}

function createIdToken({ user }) {
  return sign(
    {
      ...user,
    },
    privateKey,
    {
      algorithm: "RS256",
      issuer: getEnv("ISSUER"),
      audience: getEnv("CLIENT_ID"),
      expiresIn: "1h",
      keyid: KEY_ID,
    }
  );
}

function getEnv(name) {
  const value = process.env[name];

  if (value === undefined) {
    throw new Error(`${name} is missing.`);
  }

  return value;
}

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;

  console.log(`${req.method} ${pathname}`);

  if (
    pathname === `/${getEnv("TENANT_ID")}/v2.0/.well-known/openid-configuration`
  ) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        issuer: getEnv("ISSUER"),
        authorization_endpoint: `https://idp.auth-tools.home/${getEnv(
          "TENANT_ID"
        )}/v2.0/authorize`,
        token_endpoint: `${getEnv("ISSUER")}/token`,
        userinfo_endpoint: `${getEnv("ISSUER")}/userinfo`,
        jwks_uri: `${getEnv("ISSUER")}/jwks`,
        response_types_supported: ["code", "id_token", "token id_token"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      })
    );
  } else if (pathname === `/${getEnv("TENANT_ID")}/v2.0/authorize`) {
    const { client_id, redirect_uri, state, scope, nonce } = query;

    authentication[state] = {
      scope,
      nonce,
    };
    // Simplified login form for demonstration
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
            <html>
                <body>
                    <h1>Login</h1>
                    <form method="POST" action="/login">
                        <input type="hidden" name="client_id" value="${client_id}" />
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
  } else if (pathname === "/login" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const parsedBody = _parse(body);
      const { username, password, client_id, redirect_uri, state } = parsedBody;

      // Simplified: Validate user credentials (always succeeds in this mock)
      const code = nanoid();
      authentication[code] = authentication[state];
      res.writeHead(302, {
        Location: `${redirect_uri}?code=${code}&state=${state}`,
      });
      res.end();
    });
  } else if (pathname === `/${getEnv("TENANT_ID")}/v2.0/token`) {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const parsedBody = _parse(body);
      const { code } = parsedBody;
      const { scope, nonce } = authentication[code];
      console.log("Body:", parsedBody, scope);
      const audience = scope
        .split(" ")
        .find((s) => s.includes("/"))
        .split("/")[0];
      // Simplified: always returning tokens for the same user
      const user = users["user1"];
      const id_token = createIdToken({ user: { ...user, nonce } });
      const access_token = createAccessToken({
        user,
        scope,
        audience,
      });
      console.log("Access token:", decode(access_token));
      console.log("ID token:", decode(id_token));
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          access_token,
          id_token,
          token_type: "Bearer",
          expires_in: 3600,
        })
      );
    });
  } else if (pathname === `/${getEnv("TENANT_ID")}/v2.0/jwks`) {
    // Serve the public key in JWKS format
    const jwk = createPublicKey(publicKey).export({ format: "jwk" });
    jwk.use = "sig";
    jwk.kid = KEY_ID;
    jwk.issuer = getEnv("ISSUER");
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ keys: [jwk] }));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("Not Found");
  }
});

process.on("SIGINT", () => server.close(() => process.exit()));
process.on("SIGTERM", () => server.close(() => process.exit()));

server.listen(PORT, () => {
  console.log(`Mock OIDC provider running at http://localhost:${PORT}`);
});
