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
		 "Bad Request Errors",
	),
  403: 
  jsonContent( AppErrorResponseSchema,
		 "Forbidden Errors",
	),
  404: 
  jsonContent( AppErrorResponseSchema,
		 "Not Found Errors",
	),
  410: 
  jsonContent( AppErrorResponseSchema,
		 "Unknown Errors",
	),
  422: 
  jsonContent(AppErrorResponseSchema, 
    "Zod Validation Errors"
  ),

  503: 
  jsonContent( AppErrorResponseSchema,
		 "Internal Errors",
	),  
  },
}
)

export type ListRoutes = typeof list;