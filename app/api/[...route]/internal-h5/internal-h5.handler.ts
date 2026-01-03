import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { ListRoutes } from "./internal-h5.routes";
import { AppBindings } from "@/types/types";
import serverEnv from "@/app/internal/shared/env/env.server";
import { createTwilioMessage } from "@/app/internal/services/twilio/create-message/create";


type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

export const list: AppRouteHandler<ListRoutes > = async (c) => {

	const messageTemplateData = c.req.valid("json");
	const twilioClient = c.var.twilioClient
	
	//c.var.logger.debug({ messageTemplateData }, "createMessageTemplate called");

	//in rpoduction sends the message to the provided Phone Number; in development send it to the set Phone Number 

	const whatsappNumberTo =  serverEnv.NODE_ENV === "production" ?  messageTemplateData.phone_number :  serverEnv.TEST_TWILIO_PHONE_NUMBER;

	//c.var.logger.debug(`Number to: ${whatsappNumberTo}`);


		const response = await createTwilioMessage(twilioClient , whatsappNumberTo)

		c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
		return c.json({
			status:   response.payload.status,
			body: response.payload.body,
		}, 200)

		
		/*} catch (err: unknown) {
			if (err instanceof RestException) {
				c.var.logger.error(
					{
					message: err.message,
					status: err.status,
					code: err.code,
					moreInfo: err.moreInfo,
					details: err.details,
					},
					"Twilio REST API call failed"
				);

				// matches Twilio docs error shape
				return c.json(
					{
					status: err.status,
					code: err.code,
					message: err.message,
					more_info: err.moreInfo,
					details: err.details,
					},
					err.status ?? "500"
				);
			}
		}*/
	}
