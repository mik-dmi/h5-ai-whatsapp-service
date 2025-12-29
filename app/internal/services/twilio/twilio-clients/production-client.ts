import serverEnv from "@/app/internal/shared/env/env.server";
import { Twilio } from "twilio";

// twilio client to use in Production 

const productionTwilioClient = new Twilio(serverEnv.TWILIO_ACCOUNT_SID, serverEnv.TWILIO_AUTH_TOKEN);


export default productionTwilioClient;