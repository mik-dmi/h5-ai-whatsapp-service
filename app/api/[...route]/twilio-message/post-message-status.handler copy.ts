import { RouteConfig, RouteHandler } from "@hono/zod-openapi";
import { ListRoutes } from "./send-message.routes";
import { AppBindings } from "@/app/internal/shared/types/types";


type AppRouteHandler< R extends RouteConfig > = RouteHandler<R , AppBindings>

export const twillioWpMessageStatusHandler: AppRouteHandler<ListRoutes > = async (c) => {
	
	c.var.logger.debug({full_payload: c.req.raw })
	const messageTemplateData = c.req.valid("json");
	
	// in to update the status of the message in the DB



	//c.var.logger.debug("Twilio response to create message: %s ", response.payload.status);
	return c.json({
		success: true,
		description:   "Message status updated",
		message_status: twillioWpMessageStatusHandler.status 
	}, 200)
}
