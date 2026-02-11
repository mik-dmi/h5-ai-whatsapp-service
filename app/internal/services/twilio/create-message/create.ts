import  { Twilio } from "twilio";
import  RestException  from "twilio/lib/base/RestException";
import { TwilioErrors } from "../errors/twilio-error";
import { twilioMessageTemplate } from "@/app/api/[...route]/twilio-whatapp-message/message-handlers";



export async function createTwilioMessage(twilioClient : Twilio , whatsappNumberTo : string , twilioMessageTemplate : twilioMessageTemplate){

	try{ 
		const response = await twilioClient.messages.create(twilioMessageTemplate);
			 
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