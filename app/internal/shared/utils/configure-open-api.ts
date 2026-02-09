import { clientEnv } from "@/app/internal/shared/env/env.client";
import { AppOpenAPI } from "../types/types";
import {  Scalar } from "@scalar/hono-api-reference";
import serverEnv from "../env/env.server";

export default function configureOpenAPI(app : AppOpenAPI) {
	app.doc('/doc', {
		openapi: '3.0.0',
		info: {
			version: clientEnv.NEXT_PUBLIC_APP_VERSION,
			title: 'H5 - WhatsApp Service API',
		},
	})


// Or with dynamic configuration
	app.get(
		'/scalar',
		Scalar({
			url: '/api/v1/doc',
			theme: 'bluePlanet',
			layout:"classic",
			defaultHttpClient: {
				targetKey	: "js",
				clientKey : "fetch"
			},
			authentication: {
				preferredSecurityScheme: "BearerAuth",
				securitySchemes: {
					BearerAuth: {
					// IMPORTANT: Scalar expects the RAW token; it will add "Bearer " itself
					token:  serverEnv.APP_ENV ===  "production" ? "" : serverEnv.CURRENT_API_TOKEN,
					},
				},
			},
			persistAuth: true,

		})
	)	
}

