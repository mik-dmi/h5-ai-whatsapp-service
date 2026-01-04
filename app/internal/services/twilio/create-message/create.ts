import serverEnv from "@/app/internal/shared/env/env.server";
import { Twilio } from "twilio";
import { TwilioServerError, UnableToCreateMessageError } from "./schema";

export async function createTwilioMessage(twilioClient : Twilio , whatsappNumberTo : string ){

	const response = await twilioClient.messages.create({
		from: `whatsapp:${serverEnv.TWILIO_PHONE_NUMBER}`,
		contentSid: serverEnv.CONTENT_SIT_CREATE_MESSAGE, // (also check spelling)
		contentVariables: '{"1":"12/1","2":"3pm"}',
		to: `whatsapp:${whatsappNumberTo}`,
	});

	if (response.status === "failed"  || response.status === "undelivered" ) {

		const errorCode = response.errorCode ?? 0;
		
		const clientErrorCodes = new Set<number>([
			21211, // invalid 'To' phone number (often)
			21614, // 'To' number not valid
			30008, // unknown destination / unreachable / etc (commonly)
		]);

		if (clientErrorCodes.has(errorCode)) {
			throw new UnableToCreateMessageError(
				response.status,
				errorCode,
				response.errorMessage ?? undefined
			);
    	}
		throw new TwilioServerError(
			response.status,
			errorCode,
			response.errorMessage ?? undefined
		);
	}


	return {payload:  response}
}