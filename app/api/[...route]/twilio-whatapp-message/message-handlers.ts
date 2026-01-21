import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { AppBindings } from "@/app/internal/shared/types/types";
import serverEnv from "@/app/internal/shared/env/env.server";
import { createTwilioMessage } from "@/app/internal/services/twilio/create-message/create";


type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

import type {CreateRoute, StatusRoute } from "./send-message.routes";


export const createTwillioWpMessageHandler: AppRouteHandler<CreateRoute > = async (c) => {

	const messageTemplateData = c.req.valid("json");
	const twilioClient = c.var.twilioClient
	

	//c.var.logger.debug({ messageTemplateData }, "createMessageTemplate called");

	//in rpoduction sends the message to the provided Phone Number; in development send it to the set Phone Number 

	const whatsappNumberTo =  serverEnv.APP_ENV === "production" ?  messageTemplateData.phone_number :  serverEnv.TEST_TWILIO_PHONE_NUMBER;

	//c.var.logger.debug(`Number to: ${whatsappNumberTo}`);

	const response = await createTwilioMessage(twilioClient , whatsappNumberTo)

	c.var.logger.debug({ twilioResponse: response }, "Twilio response full payload");


	c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
	return c.json({
		success: true,
		message_status:   response.payload.status,
		body: response.payload.body,
		sid: response.payload.sid,
	}, 200)
}

export const twillioWpMessageStatusHandler: AppRouteHandler<StatusRoute > = async (c) => {
	
	c.var.logger.debug({full_payload: c.req.raw })
	const messageTemplateData = c.req.valid("json");
	
	// in to update the status of the message in the DB

	c.var.logger.debug({messageTemplateData: messageTemplateData})

	//c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
	return c.json({
		success: true,
		message_status: messageTemplateData.MessageStatus,
		body: "Callback message from twilio",
		sid: messageTemplateData.MessageSid
	}, 200)
}

