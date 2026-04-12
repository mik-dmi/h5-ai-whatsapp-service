import { z } from 'zod';
import { MessageStatus as MessageStatusInDB } from '@/prisma/generated/prisma';

export const messageStatusInTwilio = [
    'queued',
    'sending',
    'sent',
    'failed',
    'delivered',
    'undelivered',
    'receiving',
    'received',
    'accepted',
    'scheduled',
    'read',
    'partially_delivered',
    'canceled',
] as const;

//export type MessageStatusInTwilio = z.infer < typeof MessageStatusInTwilioSchema >;

export const MessageStatusInTwilioSchema = z.enum(messageStatusInTwilio);

export const MessageStatusInSupabaseSchema = z.enum(MessageStatusInDB);

export const CreateMessageResponseSchema = z.object({
    index: z.number().min(0),
    accepted: z.boolean(),
    messageId: z.string().optional(),
    error: z.string().optional(),
});

export const CreateMessagesResponseSchema = z.object({
    total: z.number(),
    acceptedCount: z.number(),
    failedCount: z.number(),
    results: z.array(CreateMessageResponseSchema),
});

export const CreateMessagePayloadSchema = z.object({
    date: z.string().max(15).min(4),
    first_name: z.string().max(30).min(2),
    last_name: z.string().max(30).min(2),
    wp_phone_number: z.string().max(20).min(9),
    template_sid: z.string().max(50).min(9),
    time: z.string().max(15).min(2),
    location: z.string(),
});

// need to improve the zod validation
export const CreateMessagesPayloadSchema = z.array(CreateMessagePayloadSchema);

export const MessageStatusBodyRequestSchema = z
    .object({
        MessageSid: z.string(),
        MessageStatus: MessageStatusInTwilioSchema,
        ErrorCode: z.string().optional(),
    })
    .loose(); // as it is what is recomended on Twilio docs

export const GetTwillioMessageStatusResponseSchema = z.object({
    success: z.boolean(),
    message_status: MessageStatusInTwilioSchema,
    body: z.string().optional(), // or nullable depending on what you decided
    sid: z.string(), //twilio message sid
});
