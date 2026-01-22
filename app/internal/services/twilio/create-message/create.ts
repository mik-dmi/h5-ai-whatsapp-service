import serverEnv from "@/app/internal/shared/env/env.server";
import  { Twilio } from "twilio";
import  RestException  from "twilio/lib/base/RestException";
import { TwilioErrors } from "../errors/twilio-error";

export async function createTwilioMessage(twilioClient : Twilio , whatsappNumberTo : string ){

	try{ 
			const response = await twilioClient.messages.create({
			from: `whatsapp:${serverEnv.TWILIO_PHONE_NUMBER}`,
			contentSid: serverEnv.CONTENT_SIT_CREATE_MESSAGE, // (also check spelling)
			contentVariables: '{"1":"12/1","2":"3pm"}',
			to: `whatsapp:${whatsappNumberTo}`,
		});
			 
		if (response.status === "failed"  || response.status === "undelivered" ) {

			const errorCode = response.errorCode  ?? 0;

				throw new TwilioErrors(
					503,
					response.errorMessage,
					"Problem with Twilio Setup",
					errorCode,
					undefined
				);
			}
		

		return {payload:  response}

	}catch(error : unknown){
		 if (error instanceof RestException) {
				throw new TwilioErrors( error.status, error.message, error.name , error.code ?? 0 , error.details)
		 }
		 throw error
	}
}