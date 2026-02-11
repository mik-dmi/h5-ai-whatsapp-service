import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { AppBindings, MessageDirection } from "@/app/internal/shared/types/types";
import serverEnv from "@/app/internal/shared/env/env.server";
import { createTwilioMessage } from "@/app/internal/services/twilio/create-message/create";

type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

import type {CreateRoute, StatusRoute } from "./send-message.routes";
import { MessageStatusBodyRequestSchema } from "./schema";
import { AppErrors } from "@/app/internal/shared/errors/app-error";

export type twilioMessageTemplate =  {
	from: string;
    contentSid: string;
    contentVariables: string;
    to: string;
}

export const createTwillioWpMessageHandler: AppRouteHandler<CreateRoute > = async (c) => {

	const messageTemplateData = c.req.valid("json");
	const twilioClient = c.var.twilioClient
	
	//in rpoduction sends the message to the provided Phone Number; in development send it to the set Phone Number 
	const whatsappNumberTo =  serverEnv.APP_ENV === "production" ?  messageTemplateData.phone_number :  serverEnv.TEST_TWILIO_PHONE_NUMBER;

	const twilioMessageTemplate : twilioMessageTemplate = {
			from: `whatsapp:${serverEnv.TWILIO_PHONE_NUMBER}`,
			contentSid: serverEnv.CONTENT_SIT_CREATE_MESSAGE,
			contentVariables: JSON.stringify({ "1": messageTemplateData.date, "2": messageTemplateData.time }),
			to: `whatsapp:${whatsappNumberTo}`,
		} 
	//create an entry in the db for that message (otimistic updates)
	
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

	// store message initial message without having creates in Twilio (it creates the message in the DB without all the necessary information) 
	const initialMessage  = await c.var.store.messages.createMessage(conversation.conversation_id , storedUser.user_id, MessageDirection.OUTBOUND,   JSON.stringify(twilioMessageTemplate), "PRE-QUEUE", null)

	try {
		// create twilio message in Twilio 
		const message = await createTwilioMessage(twilioClient , whatsappNumberTo, twilioMessageTemplate)

		// update teh message with the additional infortion profided by the creating of the message on twilio
		await c.var.store.messages.updateMessageDataByMessageId( initialMessage.message_id,  MessageDirection.OUTBOUND,   message.payload.body, message.payload.status, message.payload.sid)

		c.var.logger.debug({ twilioResponse: message }, "Twilio response full payload");
		
		return c.json({
			success: true,
			message_status:   message.payload.status,
			body: message.payload.body,
			sid: message.payload.sid,
		}, 200)
	} catch (e) {
		try {
			await c.var.store.messages.updateMessageDataByMessageId(
			initialMessage.message_id,
			MessageDirection.OUTBOUND,
			JSON.stringify(twilioMessageTemplate),
			"FAILED",
			null
			);
		} catch (dbErr) {
			c.var.logger.error({ dbErr, messageId: initialMessage.message_id }, "Failed to mark message as FAILED");
		}

		throw e; // IMPORTANT: keep the original Twilio error
		}

	}

export const twillioWpMessageStatusHandler: AppRouteHandler<StatusRoute > = async (c) => {
	
	//c.var.logger.debug({full_payload: c.req.b })
	
	const body = await c.req.parseBody();

  	c.var.logger.debug({ full_payload: body });

	const data = await MessageStatusBodyRequestSchema.parse(body);

	const updated = await c.var.store.messages.updateMessageStatusBySid(data.MessageSid, data.MessageStatus);

	//if there is an error uopdating the message it should respond 200 anyways to avoid problems with the callback function of twilio 
	if (!updated) {
		c.var.logger.error({ sid: data.MessageSid, status: data.MessageStatus }, "twilio status callback for unknown MessageSid");	// in to update the status of the message in the DB
	}
	c.var.logger.debug({parsed_body: data})

	//c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
	return c.json({
		success: true,
		message_status: data.MessageStatus,
		body: "Callback message from twilio",
		sid: data.MessageSid
	}, 200)
}

