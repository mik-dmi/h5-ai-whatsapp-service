// prism-twilio-client.ts
import { Twilio } from "twilio";
import serverEnv from "@/app/internal/shared/env/env.server";
import { PrismRequestClient } from "./prism-client";

const prismTwilioClient = new Twilio(
  serverEnv.TWILIO_ACCOUNT_SID,
  serverEnv.TWILIO_AUTH_TOKEN,
  {
    httpClient: new PrismRequestClient(serverEnv.PRISM_URL!),
  }
);

export default prismTwilioClient;
