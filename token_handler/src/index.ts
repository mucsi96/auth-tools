import http, { IncomingMessage, ServerResponse } from "http";
import { authorize } from "./authorizationController.js";
import { getEnv, returnError } from "./utils.js";
import { getToken } from "./tokenController.js";
import { getUserInfo } from "./userInfoController.js";
import { logout } from "./logoutController.js";

const PORT = process.env.PORT || 8080;
const BASE_PATH = getEnv("BASE_PATH");

const server = http.createServer(
  async (req: IncomingMessage, res: ServerResponse) => {
    try {
      if (req.url === "/health" && req.method === "GET") {
        res.writeHead(200);
        res.end("Health check passed!");
        return;
      }

      console.log(req.method, req.url);

      if (req.url === BASE_PATH + "/user-info" && req.method === "GET") {
        return await getUserInfo(req, res);
      }

      if (req.url === BASE_PATH + "/authorize" && req.method === "POST") {
        return await authorize(req, res);
      }
      
      if (req.url === BASE_PATH + "/get-token" && req.method === "POST") {
        return await getToken(req, res);
      }

      if (req.url === BASE_PATH + "/logout" && req.method === "POST") {
        return await logout(req, res);
      }

      return returnError(res, 404, "Route not found");
    } catch (e) {
      console.log((e as Error).stack);
      return returnError(res, 500, "Something went wrong");
    }
  }
);

server.listen(PORT, () => {
  console.log(`server started on port: ${PORT}. Basepath: ${BASE_PATH}`);
});

// Graceful shutdown on SIGTERM signal
process.on("SIGTERM", () => {
  console.info("Received SIGTERM signal. Closing server gracefully.");
  server.close(() => {
    console.log("Server closed. Exiting process.");
    process.exit(0);
  });
});
