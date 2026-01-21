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

export type MessageStatus = typeof messageStatusValues[number];

export const MessageStatusSchema = z.enum(messageStatusValues);

export const CreateMessageTemplateResponseSchema = z.object({
  success: z.boolean(),
  message_status: MessageStatusSchema,
  body: z.string().optional(), // or nullable depending on what you decided
  sid: z.string(),
});



// need to improve the zod validation
export const CreateMessageTemplateBodySchema = z.object({
  date: z.string().max(15).min(4),
  time: z.string().max(15).min(2),
  phone_number: z.string().max(20).min(9),
  first_name: z.string().max(30).min(2),
});

export const MessageStatusBodyRequestSchema = z.object({
  ChannelPrefix: z.string().max(50).min(2),
  MessageStatus: MessageStatusSchema,
  SmsSid: z.string().max(50).min(5),
  ChannelInstallSid: z.string().max(50).min(5),
  MessageSid: z.string().max(50).min(5),
});







