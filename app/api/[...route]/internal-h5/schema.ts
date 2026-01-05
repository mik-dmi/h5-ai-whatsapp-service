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

export const BadRequestSchema = z.object({
  message: z.string(),
});

export const ValidationErrorSchema = createErrorSchema(CreateMessageTemplateBodySchema);


export type MessageStatus = typeof messageStatusValues[number];

export const MessageStatusSchema = z.enum(messageStatusValues);

export const CreateMessageTemplateResponseSchema = z.object({
  success: z.boolean(),
  status: MessageStatusSchema,
  body: z.string().optional(), // or nullable depending on what you decided
});

////

export const AppIssueSchema = z.object({
  code: z.string(),
  path: z.array(z.union([z.string(), z.number()])),
  message: z.string().optional(),
  details: z.unknown().optional(), // <- generic, flexible
});

export const AppErrorResponseSchema = z.object({
  success: z.boolean().openapi({ example: false }),
  error: z.object({
    name: z.string(),
    issues: z.array(AppIssueSchema),
  }),
});



