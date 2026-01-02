import { ContentfulStatusCode } from "hono/utils/http-status";
import {MessageStatus}  from "twilio/lib/rest/api/v2010/account/message"



export class TwilioErrors extends Error {
	statusCode: ContentfulStatusCode; // the code that will be returned to the client 
	statusRequestCodeTwilio: number; // the code that come from twilio API
	status : MessageStatus ;

    constructor(message: string, statusRequestCodeTwilio: number , status : MessageStatus, statusCode: ContentfulStatusCode) {
        super(message);
		this.statusCode = statusCode;
		this.status =  status;
        this.name = 'ThirdPartyMessagingAPIError';
        this.statusRequestCodeTwilio = statusRequestCodeTwilio;
    }
}

export class UnableToCreateMessageError extends TwilioErrors {
    constructor( twilioMessageStatus : MessageStatus, body: string , errorCode : number , errorMessage: string ) {
        super(errorMessage ?? 'Message not created', errorCode , twilioMessageStatus , 400 );
    }
}


export class TwilioServerError extends TwilioErrors {
    constructor( twilioMessageStatus : MessageStatus, body: string , errorCode : number , errorMessage: string ) {
        super(errorMessage ?? 'Third party server error', errorCode , twilioMessageStatus , 500 );
    }
}