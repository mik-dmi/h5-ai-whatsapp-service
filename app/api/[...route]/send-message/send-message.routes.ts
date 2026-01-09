import  jsonContent, { jsonContentRequired } from "@/app/internal/shared/utils/json-content";
import { createRoute } from "@hono/zod-openapi";
import {  CreateMessageTemplateBodySchema, CreateMessageTemplateResponseSchema } from "./schema";
import { AppErrorResponseSchema } from "@/app/internal/shared/errors/schema";
import { TwilioErrorResponseSchema } from "@/app/internal/services/twilio/schema";

const tags = ["Internal H5"];

export  const list = createRoute({
  tags,
  method: "post",
  path: "/createMessageTemplate", 
  request: {
    body: jsonContentRequired(
        CreateMessageTemplateBodySchema,
        "Sending the data for sending messages on Whatsapp"
    ),
  },
  responses: {
	200: jsonContent( CreateMessageTemplateResponseSchema,
		 "Endpoint to create Messages"
	),
  400: 
  jsonContent( TwilioErrorResponseSchema,
		 "Bad Request Errors",
	),
  401 : jsonContent (AppErrorResponseSchema, 
    "Unauthorized"),
  403: 
  jsonContent( TwilioErrorResponseSchema,
		 "Forbidden Errors",
	),
  404: 
  jsonContent( TwilioErrorResponseSchema,
		 "Not Found Errors",
	),
  410: 
  jsonContent( TwilioErrorResponseSchema,
		 "Unknown Errors",
	),
  422: 
  jsonContent(AppErrorResponseSchema, 
    "Zod Validation Errors"
  ),
  429: 
  jsonContent(TwilioErrorResponseSchema, 
    "Rate Limit"
  ),

  503: 
  jsonContent( AppErrorResponseSchema,
		 "Internal Errors",
	),  
  },
}
)

export type ListRoutes = typeof list;