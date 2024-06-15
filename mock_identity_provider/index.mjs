import { createServer } from "http";
import { parse } from "url";
import { parse as _parse } from "querystring";
import { generateKeyPairSync, createPublicKey } from "crypto";
import jsonwebtoken from "jsonwebtoken";
import { nanoid } from "nanoid";

const { sign, verify } = jsonwebtoken;
const PORT = 8080;
const JWT_SECRET = "your_secret_key";
const ISSUER = "https://idp.auth-tools.home";

// Mock user data
const users = {
  user1: { sub: "user1", name: "User One", email: "user1@example.com" },
  user2: { sub: "user2", name: "User Two", email: "user2@example.com" },
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

function createToken(user) {
  return sign(user, privateKey, {
    algorithm: "RS256",
    issuer: ISSUER,
    audience: ISSUER,
    expiresIn: "1h",
  });
}

const server = createServer((req, res) => {
  const parsedUrl = parse(req.url, true);
  const { pathname, query } = parsedUrl;

  console.log(`${req.method} ${pathname}`);

  if (pathname === "/.well-known/openid-configuration") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        issuer: ISSUER,
        authorization_endpoint: `${ISSUER}/authorize`,
        token_endpoint: `${ISSUER}/token`,
        userinfo_endpoint: `${ISSUER}/userinfo`,
        jwks_uri: `${ISSUER}/jwks`,
        response_types_supported: ["code", "id_token", "token id_token"],
        subject_types_supported: ["public"],
        id_token_signing_alg_values_supported: ["RS256"],
      })
    );
  } else if (pathname === "/authorize") {
    const { client_id, redirect_uri, state } = query;
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
      res.writeHead(302, {
        Location: `${redirect_uri}?code=${code}&state=${state}`,
      });
      res.end();
    });
  } else if (pathname === "/token") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      const parsedBody = _parse(body);
      const { code, client_id, redirect_uri, grant_type } = parsedBody;
      // Simplified: always returning tokens for the same user
      const user = users["user1"];
      const id_token = createToken(user);
      const access_token = createToken({
        ...user,
        scope: "openid profile email",
      });
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
  } else if (pathname === "/jwks") {
    // Serve the public key in JWKS format
    const jwk = createPublicKey(publicKey).export({ format: "jwk" });
    jwk.use = "sig";
    jwk.kid = "test-key";
    jwk.alg = "RS256";
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
