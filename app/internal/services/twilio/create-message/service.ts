import { Twilio } from 'twilio';
import RestException from 'twilio/lib/base/RestException';
import z from 'zod';
import { Storage } from '@/app/internal/storage/storage';
import serverEnv from '@/app/internal/shared/env/env.server';
import {
    CreateMessagePayloadSchema,
    CreateMessageResponseSchema,
} from '@/app/api/[...route]/twilio-whatapp-message/schema';
import { InMemoryQueue } from '@/app/internal/shared/queue/in-memory-queue';
import { InMemoryQueueError } from '@/app/internal/shared/queue/erros';
import { messages } from '@/prisma/generated/prisma';
import { TwilioErrors } from './exeption';

type UserMessagePayload = z.infer<typeof CreateMessagePayloadSchema>;

export type TwilioMessageTemplateData = {
    from: string;
    contentSid: string;
    contentVariables: string;
    to: string;
};

type BatchItemResult = z.infer<typeof CreateMessageResponseSchema>;

export async function sendWhatsappMessageToUser(
    store: Storage,
    messagesToProcess: UserMessagePayload[],
) {
    //check if there is enough space left in the queue to enqueue all the message in the payload
    if (InMemoryQueue.remainingCapacity - messagesToProcess.length < 0) {
        throw new InMemoryQueueError(
            'user payload exceeds the queue remaining capacity',
            507,
        );
    }

    const results: BatchItemResult[] = [];

    for (let i = 0; i < messagesToProcess.length; i++) {
        let storedMessage: messages | null = null;
        try {
            const messagePayload = messagesToProcess[i];

            const twilioMessageTemplate = createTwilioTemplate(messagePayload);

            storedMessage = await store.createOutboundMessageForQueue(
                twilioMessageTemplate,
                messagePayload.wp_phone_number,
            );

            InMemoryQueue.enqueue(storedMessage.message_id);

            results.push({
                index: i,
                accepted: true,
                messageId: storedMessage.message_id,
            });
        } catch (error) {
            console.error(
                'error initiating messages in to the db and queue: ',
                error,
            );
            if (storedMessage) {
                await store.messages.updateMessageDataByMessageId(
                    storedMessage.message_id,
                    null,
                    null,
                    'failed_to_queue',
                    null,
                );
            }
            results.push({
                index: i,
                accepted: false,
                error: error instanceof Error ? error.message : 'unknown error',
            });
        }
    }

    return {
        total: results.length,
        acceptedCount: results.filter((result) => result.accepted === true)
            .length,
        failedCount: results.filter((result) => result.accepted === false)
            .length,
        results: results,
    };
}

export function createTwilioTemplate(messagePayload: UserMessagePayload) {
    //in production sends the message to the provided Phone Number; in development send it to the set Phone Number
    const whatsappNumberTo =
        serverEnv.APP_ENV === 'production'
            ? messagePayload.wp_phone_number
            : serverEnv.TEST_TWILIO_PHONE_NUMBER;

    const twilioMessageTemplate: TwilioMessageTemplateData = {
        from: `whatsapp:${serverEnv.TWILIO_PHONE_NUMBER}`,
        contentSid: messagePayload.template_sid,
        contentVariables: JSON.stringify({
            '1': messagePayload.date,
            '2': messagePayload.time,
        }),
        to: `whatsapp:${whatsappNumberTo}`,
    };
    return twilioMessageTemplate;
}

export async function createTwilioMessage(
    twilioClient: Twilio,
    twilioMessageTemplate: TwilioMessageTemplateData,
) {
    try {
        const response = await twilioClient.messages.create(
            twilioMessageTemplate,
        );
        return response;
    } catch (error: unknown) {
        if (error instanceof RestException) {
            throw new TwilioErrors(
                error.status,
                error.message,
                error.name,
                error.code ?? 0,
                error.details,
            );
        }
        throw error;
    }
}
