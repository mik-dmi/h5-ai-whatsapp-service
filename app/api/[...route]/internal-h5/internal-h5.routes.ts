import  jsonContent, { jsonContentRequired } from "@/app/internal/shared/utils/json-content";
import { createRoute, z } from "@hono/zod-openapi";
import { BadRequestSchema, CreateMessageTemplateBodySchema, CreateMessageTemplateResponseSchema, MessageStatusSchema, ValidationErrorSchema } from "./schema";
import { InternalErrorSchema } from "@/types/types";

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
  jsonContent( BadRequestSchema,
		 "The validation error(s)",
	),
  422: 
  jsonContent(ValidationErrorSchema, 
    "Zod validation errors"
  ),

  500: 
  jsonContent( InternalErrorSchema,
		 "Any other error(s)",
	),  
  },
}
)

export type ListRoutes = typeof list;