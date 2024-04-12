import { Client } from "oauth4webapi";
import { getEnv } from "./utils.js";

export const client: Client = {
  client_id: getEnv("CLIENT_ID"),
  client_secret: getEnv("CLIENT_SECRET"),
  token_endpoint_auth_method: "client_secret_basic",
};
