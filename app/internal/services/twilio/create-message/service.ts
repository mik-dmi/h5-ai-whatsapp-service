import { Twilio } from 'twilio';
import RestException from 'twilio/lib/base/RestException';
import { TwilioErrors } from '../errors/twilio-error';
import z from 'zod';
import { Storage } from '@/app/internal/storage/storage';
import serverEnv from '@/app/internal/shared/env/env.server';
import {
    CreateMessagePayloadSchema,
    CreateMessageResponseSchema,
} from '@/app/api/[...route]/twilio-whatapp-message/schema';
import { MessageDirection } from '@/app/internal/shared/types/types';
import { InMemoryQueue } from '@/app/internal/shared/queue/in-memory-queue';
import { InMemoryQueueError } from '@/app/internal/shared/queue/erros';
import { messages } from '@/prisma/generated/prisma';

type UserMessagePayload = z.infer<typeof CreateMessagePayloadSchema>;

export type TwilioMessageTemplateData = {
    from: string;
    contentSid: string;
    contentVariables: string;
    to: string;
};

type BatchItemResult = {
    index: number;
    accepted: boolean;
    messageId?: bigint;
    error?: string;
};

type BatchResult = {
    total: number;
    acceptedCount: number;
    failedCount: number;
    results: BatchItemResult[];
};

type CreateMessageResponse = z.infer<typeof CreateMessageResponseSchema>;

export async function sendWhatsappMessageToUser(
    store: Storage,
    twilioClient: Twilio,
    messagesPayload: UserMessagePayload[],
) {
    const responsePayload: CreateMessageResponse[] = [];

    // store and add to in-memory queue all messages
    const messagesBeforeTwilio = await initiateAllMessagesInDataBaseAndQueue(
        store,
        messagesPayload,
    );

    for (let i = 0; i < messagesPayload.length; i++) {
        let messageBeforeTwilio;

        const messagePayload = messagesPayload[i];

        const twilioMessageTemplate = createTwilioTemplate(messagePayload);
        try {
            messageBeforeTwilio = await storeUserMessage(
                store,
                twilioMessageTemplate,
            );

            // Create Twilio message in Twilio
            const message = await createTwilioMessage(
                twilioClient,
                twilioMessageTemplate,
            );

            // update the message with the additional information profided by the creation of the message on twilio
            const updatedMessage =
                await store.messages.updateMessageDataByMessageId(
                    messageBeforeTwilio.message_id,
                    MessageDirection.OUTBOUND,
                    message.body,
                    message.status,
                    message.sid,
                );

            responsePayload.push({
                success: true,
                message_status: updatedMessage.message_status,
                body: updatedMessage.message_text ?? '',
                sid: updatedMessage.twilio_message_sid,
            });
        } catch (e) {
            console.error('Error: ', e);

            if (messageBeforeTwilio) {
                await store.messages.updateMessageDataByMessageId(
                    messageBeforeTwilio.message_id,
                    MessageDirection.OUTBOUND,
                    JSON.stringify(twilioMessageTemplate),
                    'failed',
                    null,
                );
            }
        }
    }

    return responsePayload;
}

export async function initiateAllMessagesInDataBaseAndQueue(
    store: Storage,
    messagesPayload: UserMessagePayload[],
) {
    //check if there is enough space left in the queue to enqueue all the message in the payload
    if (InMemoryQueue.remainingCapacity - messagesPayload.length < 0) {
        throw new InMemoryQueueError(
            'user payload exceeds the queue remaining capacity',
            507,
        );
    }

    const results = [];

    for (let i = 0; i < messagesPayload.length; i++) {
        let storedMessage: messages | null = null;
        try {
            const messagePayload = messagesPayload[i];

            const twilioMessageTemplate = createTwilioTemplate(messagePayload);

            storedMessage = await store.createOutboundMessageForQueue(
                twilioMessageTemplate,
            );

            InMemoryQueue.enqueue(storedMessage);

            results.push({
                index:i, 
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
                    'failed_in_memory_queuing',
                    null,
                );
            }
            results.push({
                index: i , 
                accepted: false,
                error: error instanceof Error ? error.message : 'unknown error',
            });
        }
    }
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

export async function storeUserMessage(
    store: Storage,
    twilioMessageTemplate: TwilioMessageTemplateData,
) {
    const userWhatsappNumber = twilioMessageTemplate.to;

    //check for user in the db
    let storedUser = await store.users.getUser(userWhatsappNumber);

    // no previous entry, create an entry
    if (storedUser === null) {
        storedUser = await store.users.createUser(userWhatsappNumber);
    }

    console.log('debug: user entry created on db');

    //get conversation
    let conversation = await store.conversations.getOpenConversation(
        storedUser.user_id,
    );

    // no previous conversation, create an entry
    if (conversation === null) {
        conversation = await store.conversations.createConversation(
            storedUser.user_id,
        );
    }

    // store message initial message without having creates in Twilio (it creates the message in the DB without all the necessary information)
    const initialMessage = await store.messages.createMessage(
        conversation.conversation_id,
        storedUser.user_id,
        MessageDirection.OUTBOUND,
        JSON.stringify(twilioMessageTemplate),
        'pre_in_memory_queue',
        null,
    );

    return initialMessage;
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
