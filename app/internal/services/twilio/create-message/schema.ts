import { ContentfulStatusCode } from "hono/utils/http-status";
import {MessageStatus}  from "twilio/lib/rest/api/v2010/account/message"


/*
export class TwilioErrors extends Error {
	status: ContentfulStatusCode; // the code that will be returned to the client 
	statusRequestCodeTwilio: number; // the code that come from twilio API
	twilioMessageStatus : MessageStatus ;

    constructor(message: string, statusRequestCodeTwilio: number , twilioMessageStatus : MessageStatus, status: ContentfulStatusCode) {
        super(message);
		this.status = status;
		this.twilioMessageStatus =  twilioMessageStatus;
        this.name = 'ThirdPartyMessagingAPIError';
        this.statusRequestCodeTwilio = statusRequestCodeTwilio;
    }
    //for twilio
    getDetails() {
    return {
      provider: "twilio" as const,
      messageStatus: this.twilioMessageStatus,
      errorCode: this.statusRequestCodeTwilio,
      errorMessage: this.message,
    };
  }
}

export class UnableToCreateMessageError extends TwilioErrors {
  constructor(twilioMessageStatus: MessageStatus, errorCode: number, errorMessage?: string) {
    super(errorMessage ?? "Message not created", errorCode, twilioMessageStatus, 400);
  }
}

export class TwilioServerError extends TwilioErrors {
  constructor(twilioMessageStatus: MessageStatus, errorCode: number, errorMessage?: string) {
    super(errorMessage ?? "Third party server error", errorCode, twilioMessageStatus, 500);
  }
}*/


export class TwilioErrors extends Error {
  status: ContentfulStatusCode;
  statusRequestCodeTwilio: number;
  twilioMessageStatus: MessageStatus;
  code: string;

  constructor(
    message: string,
    code: string,
    statusRequestCodeTwilio: number,
    twilioMessageStatus: MessageStatus,
    status: ContentfulStatusCode
  ) {
    super(message);
    this.status = status;
    this.twilioMessageStatus = twilioMessageStatus;
    this.code = code;
    this.name = "ThirdPartyMessagingAPIError";
    this.statusRequestCodeTwilio = statusRequestCodeTwilio;
  }
}

export class UnableToCreateMessageError extends TwilioErrors {
  constructor(twilioMessageStatus: MessageStatus, errorCode: number, errorMessage?: string) {
    super(errorMessage ?? "Message not created", "TWILIO_CLIENT_ERROR", errorCode, twilioMessageStatus, 400);
  }
}

export class TwilioServerError extends TwilioErrors {
  constructor(twilioMessageStatus: MessageStatus, errorCode: number, errorMessage?: string) {
    super(errorMessage ?? "Third party server error", "TWILIO_SERVER_ERROR", errorCode, twilioMessageStatus, 500);
  }
}
