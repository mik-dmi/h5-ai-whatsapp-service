import  jsonContent, { jsonContentRequired } from "@/app/internal/shared/utils/json-content";
import { createRoute } from "@hono/zod-openapi";
import { AppErrorResponseSchema, CreateMessageTemplateBodySchema, CreateMessageTemplateResponseSchema, ValidationErrorSchema } from "./schema";

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
  jsonContent( AppErrorResponseSchema,
		 "Bad request errors",
	),
  422: 
  jsonContent(ValidationErrorSchema, 
    "Zod validation errors"
  ),

  500: 
  jsonContent( AppErrorResponseSchema,
		 "Internal errors",
	),  
  },
}
)

export type ListRoutes = typeof list;