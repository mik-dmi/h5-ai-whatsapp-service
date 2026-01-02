import serverEnv from "@/app/internal/shared/env/env.server";
import { Twilio } from "twilio";
import { TwilioServerError, UnableToCreateMessageError } from "./schema";
import { RESPONSE_LIMIT_DEFAULT } from "next/dist/server/api-utils";
import { error } from "console";




export async function createTwilioMessage(twilioClient : Twilio , whatsappNumberTo : string ){

	const response = await twilioClient.messages.create({
		from: `whatsapp:${serverEnv.TWILIO_PHONE_NUMBER}`,
		contentSid: serverEnv.CONTENT_SIT_CREATE_MESSAGE, // (also check spelling)
		contentVariables: '{"1":"12/1","2":"3pm"}',
		to: `whatsapp:${whatsappNumberTo}`,
	});

	if (response.status === "failed"  || response.status === "undelivered" ) {

		if( response.errorCode >= 400 && response.errorCode < 500){
        	throw new UnableToCreateMessageError(  response.status, response.body , response.errorCode , response.errorMessage);
		}

		throw new TwilioServerError(response.status, response.body , response.errorCode , response.errorMessage);

	}

	return {payload:  response}


}