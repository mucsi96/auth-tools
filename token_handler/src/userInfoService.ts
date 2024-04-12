import {
  WWWAuthenticateChallenge,
  parseWwwAuthenticateChallenges,
  processUserInfoResponse,
  userInfoRequest
} from "oauth4webapi";
import { client } from "./clientConfig.js";
import { discover } from "./discoveryService.js";

export async function getUserInfo({
  subject,
  accessToken,
}: {
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
