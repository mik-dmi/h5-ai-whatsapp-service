import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { ListRoutes } from "./internal-h5.routes";
import { AppBindings } from "@/types/types";
import serverEnv from "@/app/internal/shared/env/env.server";
import { stringify } from "querystring";

type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

export const list: AppRouteHandler<ListRoutes > = async (c) => {

	const messageTemplateData = c.req.valid("json");
	
	//c.var.logger.debug({ messageTemplateData }, "createMessageTemplate called");

	//in rpoduction sends the message to the provided Phone Number; in development send it to the set Phone Number 

	const whatsappNumberTo =  serverEnv.NODE_ENV === "production" ?  messageTemplateData.phone_number :  serverEnv.TEST_TWILIO_PHONE_NUMBER;


	//c.var.logger.debug(`Number to: ${whatsappNumberTo}`);

	try {
		const response = await c.var.twilioClient.messages.create({
			from: `whatsapp:${serverEnv.TWILIO_PHONE_NUMBER}`,
			contentSid: serverEnv.CONTENT_SIT_CREATE_MESSAGE, // (also check spelling)
			contentVariables: '{"1":"12/1","2":"3pm"}',
			to: `whatsapp:${whatsappNumberTo}`,
		});

		c.var.logger.debug("Twilio response to create message: %s ", response.status);
		return c.json({
			status:  response.status,
			body: response.body,
		}, 200)

		
		} catch (err: any ) {
			c.var.logger.error(
    {
      message: err.message,
      status: err.status,
      code: err.code,
      moreInfo: err.moreInfo,
      details: err.details,
      twilioError: err,
    },
    "Twilio message create failed"
  );
			return c.json(
				{
				message: stringify(err),
				
				},
				500
			); 
		}
	
	
}


