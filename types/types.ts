import { OpenAPIHono, z } from "@hono/zod-openapi";
import { PinoLogger } from "hono-pino";
import { Twilio } from "twilio";
import z4 from "zod/v4";

//inject depencies that need to be availale in the 
export interface  AppBindings {
  Variables :{
    logger: PinoLogger;
    twilioClient: Twilio;    
  }, 

}

export function toZodV4SchemaTyped<T extends z4.ZodTypeAny>(
  schema: T,
) {
  return schema as unknown as z.ZodType<z4.infer<T>>;
}

export const InternalErrorSchema = z.object({
  message: z.string(),
  stack: z.string().optional(),
});



export type ZodSchema = z.ZodUnion | z.ZodAny  | z.ZodArray<z.ZodAny>;
export type ZodIssue = z.ZodIssue;
export type AppOpenAPI = OpenAPIHono<AppBindings>