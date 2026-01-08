import { pinoLogger } from "hono-pino";
import notFound from "@/app/internal/shared/errors/not-found";
import onError from "@/app/internal/shared/errors/on-error";
import { OpenAPIHono } from "@hono/zod-openapi";
import pino from "pino";
import pretty from "pino-pretty";
import { AppBindings } from "@/app/internal/shared/types/types";
import serverEnv, { API_TOKENS } from "@/app/internal/shared/env/env.server";
import defaultHook from "@/app/internal/shared/utils/default-hook";
import productionTwilioClient from "@/app/internal/services/twilio/twilio-clients/production-client";
import prismTwilioClient from "@/app/internal/services/twilio/twilio-clients/prism-client/prism-twilio-client";
import { bearerAuth } from "hono/bearer-auth";
import { safeEqual } from "@/app/internal/shared/utils/utils";
import { TwilioErrors } from "@/app/internal/services/twilio/errors/twilio-error";

export  function createRouter(){
	return new OpenAPIHono<AppBindings>({
		strict : false ,
		defaultHook: defaultHook,
	})
}
export default function createApp(){

	const app = createRouter().basePath("/api/v1");

	//set up to get token in case of rotation


	//adding logger as a dependency to an app
	app.use(
	  pinoLogger({
		pino: pino(
		  { level : serverEnv.LOG_LEVEL },
		  serverEnv.NODE_ENV === "production" ? undefined : pretty() 
	
		),
		http:{
		  reqId: () => crypto.randomUUID(),
		}
	  })
	);

	//adding twilio client as a dependency to an app 
	app.use("*", async (c, next) => {
		const twilioClient = serverEnv.NODE_ENV === "production" ?  productionTwilioClient : prismTwilioClient

		c.var.logger.debug(`Prism URL : ${serverEnv.PRISM_URL}`)
		c.set("twilioClient", twilioClient) // <- this is what makes c.var.twilioClient work
		await next()
	})

	//add Bearer Authentication
	app.use('/api/v1/*', bearerAuth( 
		{
			token : API_TOKENS,
			invalidToken: { message: "Unauthorized" },
			noAuthenticationHeader: new TwilioErrors(
								503,
								"Unauthorized",
								"Problem with Twilio Setup",
								401,
								undefined
							),
			
			verifyToken: async (token) => {
				// prevents timing attack (not sure if necessary)
				return API_TOKENS.some((t) => safeEqual(token, t));
			},

		}
	))

	app.notFound(notFound)
	app.onError(onError)
	
	
	return app;

}

