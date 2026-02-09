import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { AppBindings, MessageDirection } from "@/app/internal/shared/types/types";
import serverEnv from "@/app/internal/shared/env/env.server";
import { createTwilioMessage } from "@/app/internal/services/twilio/create-message/create";


type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

import type {CreateRoute, StatusRoute } from "./send-message.routes";
import { MessageStatusBodyRequestSchema } from "./schema";


export const createTwillioWpMessageHandler: AppRouteHandler<CreateRoute > = async (c) => {

	const messageTemplateData = c.req.valid("json");
	const twilioClient = c.var.twilioClient
	
	//c.var.logger.debug({ messageTemplateData }, "createMessageTemplate called");

	//in rpoduction sends the message to the provided Phone Number; in development send it to the set Phone Number 

	
	const whatsappNumberTo =  serverEnv.APP_ENV === "production" ?  messageTemplateData.phone_number :  serverEnv.TEST_TWILIO_PHONE_NUMBER;

	//c.var.logger.debug(`Number to: ${whatsappNumberTo}`);

	const message = await createTwilioMessage(twilioClient , whatsappNumberTo)

	c.var.logger.debug({ twilioResponse: message }, "Twilio response full payload");

	
	//check for user in the db
	let storedUser =  await c.var.store.users.getUser(whatsappNumberTo)

	// no previous entry, create an entry
	if(storedUser === null ){
		storedUser = await c.var.store.users.createUser(whatsappNumberTo)
	}
	c.var.logger.debug("user entry created on db")

	//get convertion 
	let conversation = await c.var.store.conversations.getOpenConversation(storedUser.user_id)

	if(conversation === null){	
		conversation = await c.var.store.conversations.createConversation(storedUser.user_id)
	}

	// store message 

	
	await c.var.store.messages.createMessage(conversation.conversation_id , storedUser.user_id, MessageDirection.OUTBOUND,  message.payload.body , message.payload.status, message.payload.sid)
	 
	c.var.logger.debug({ conversation_id : conversation.conversation_id , userId: storedUser.user_id, messageDirection : MessageDirection.OUTBOUND, body:  message.payload.body , messageStatus: message.payload.status, messageSid: message.payload.sid }, "Debug field used to create a message: ");

	return c.json({
		success: true,
		message_status:   message.payload.status,
		body: message.payload.body,
		sid: message.payload.sid,
	}, 200)
}

export const twillioWpMessageStatusHandler: AppRouteHandler<StatusRoute > = async (c) => {
	
	c.var.logger.debug({full_payload: c.req.raw })
	
	const body = await c.req.parseBody();

  	c.var.logger.debug({ full_payload: body });

	const data = await MessageStatusBodyRequestSchema.parse(body);

	
	// in to update the status of the message in the DB

	c.var.logger.debug({parsed_body: data})

	//c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
	return c.json({
		success: true,
		message_status: data.MessageStatus,
		body: "Callback message from twilio",
		sid: data.MessageSid
	}, 200)
}

