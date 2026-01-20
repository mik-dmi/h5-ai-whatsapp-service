import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { ListRoutes } from "./send-message.routes";
import { AppBindings } from "@/app/internal/shared/types/types";
import serverEnv from "@/app/internal/shared/env/env.server";
import { createTwilioMessage } from "@/app/internal/services/twilio/create-message/create";


type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

export const createTwillioWpMessageHandler: AppRouteHandler<ListRoutes > = async (c) => {
	c.var.logger.info("Here 1 " ) 

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
		status:   response.payload.status,
		body: response.payload.body,
		sid: response.payload.accountSid,
	}, 200)
}
