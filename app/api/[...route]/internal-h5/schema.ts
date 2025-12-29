import createErrorSchema from "@/app/internal/shared/utils/create-error-schema";
import { z } from "zod";

export const messageStatusValues = [
  "queued",
  "sending",
  "sent",
  "failed",
  "delivered",
  "undelivered",
  "receiving",
  "received",
  "accepted",
  "scheduled",
  "read",
  "partially_delivered",
  "canceled",
] as const;

export const CreateMessageTemplateBodySchema = z.object({
  date: z.string(),
  time: z.string(),
  phone_number: z.string(),
  first_name: z.string(),
});



export const ValidationErrorSchema = createErrorSchema(CreateMessageTemplateBodySchema);


export type MessageStatus = typeof messageStatusValues[number];

export const MessageStatusSchema = z.enum(messageStatusValues);

export const CreateMessageTemplateResponseSchema = z.object({
  status: MessageStatusSchema,
  body: z.string().optional(), // or nullable depending on what you decided
});
