import { pinoLogger } from "hono-pino";
import { OpenAPIHono } from "@hono/zod-openapi";
import pino from "pino";
import pretty from "pino-pretty";
import { AppBindings } from "@/app/internal/shared/types/types";
import { timeout } from "hono/timeout";
import serverEnv from "@/app/internal/shared/env/env.server";
import { bearerAuthMiddleware } from "@/app/internal/shared/middleware/bearer-auth";
import onError from "@/app/internal/shared/middleware/on-error";
import notFound from "@/app/internal/shared/middleware/not-found";
import productionTwilioClient from "@/app/internal/services/twilio/twilio-clients/production-client";
import prismTwilioClient from "@/app/internal/services/twilio/twilio-clients/prism-client/prism-twilio-client";
import defaultHook from "@/app/internal/shared/utils/default-hook";
import { NewPrismaStorage } from "@/app/internal/storage/store";
import { prisma } from "@/app/internal/services/prisma/client";

export  function createRouter(){
	return new OpenAPIHono<AppBindings>({
		strict : false ,
		defaultHook: defaultHook,
	})
}
export default function createApp(){

	const app = createRouter().basePath("/api/v1");

	//adding logger as a dependency to an app
	app.use(
	  pinoLogger({
		pino: pino(
		  { level : serverEnv.LOG_LEVEL },
		  serverEnv.APP_ENV === "production" ? undefined : pretty() 
	
		),
		http:{
		  reqId: () => crypto.randomUUID(),
		}
	  })
	);

	//adding twilio and prisma client as a dependency to an app 
	app.use("*", async (c, next) => {
		const twilioClient = serverEnv.APP_ENV === "production" ?  productionTwilioClient : prismTwilioClient
		c.set("twilioClient", twilioClient) 
		c.var.logger.debug(`twilioClient in ${serverEnv.APP_ENV} environment: ${twilioClient}`)
		
		c.var.logger.debug(`Prism URL : ${serverEnv.PRISM_URL}`)

		
		const store = NewPrismaStorage(prisma)

		

		c.set("store", store )

		
		await next()
	})

	//add Bearer Authentication
	app.use('*', bearerAuthMiddleware )

	// max time for routes to respond back 
	app.use('*', timeout(5000))

	app.notFound(notFound)
	app.onError(onError)
	
	return app;
}




