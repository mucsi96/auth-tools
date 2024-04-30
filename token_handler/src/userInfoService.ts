import {
  Client,
  WWWAuthenticateChallenge,
  parseWwwAuthenticateChallenges,
  processUserInfoResponse,
  userInfoRequest
} from "oauth4webapi";
import { discover } from "./discoveryService.js";

export async function getUserInfo({
  client,
  subject,
  accessToken,
}: {
  client: Client;
  subject: string;
  accessToken: string;
}) {
  const authorizationServer = await discover();

  const response = await userInfoRequest(
    authorizationServer,
    client,
    accessToken
  );

  let challenges: WWWAuthenticateChallenge[] | undefined;
  if ((challenges = parseWwwAuthenticateChallenges(response))) {
    for (const challenge of challenges) {
      console.log("challenge", challenge);
    }
    throw new Error("www-authenticate challenge");
  }

  const result = await processUserInfoResponse(
    authorizationServer,
    client,
    subject,
    response
  );

  return result;
}
