import { Twilio } from 'twilio';
import { InMemoryQueue } from './in-memory-queue';
import { createTwilioMessage } from '../../services/twilio/create-message/service';
import { Storage } from '../../storage/storage';

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function startWhatsappMessageWorker(
    store: Storage,
    twilioClient: Twilio,
) {
    while (true) {
        const queuedMessageId = InMemoryQueue.dequeue();

        if (!queuedMessageId) {
            await sleep(300);
            continue;
        }
        console.log('worker is processing');

        try {
            const messageData =
                await store.messages.getMessageByMessageId(queuedMessageId);

            if (!messageData || messageData.message_text) {
                console.error(
                    `dequeue message does not have any data in the DB: message_id ${queuedMessageId}`,
                );
                continue;
            }

            const twilioPayload = JSON.parse(messageData.message_text ?? '');

            await store.messages.updateMessageStatusByMessageId(
                queuedMessageId,
                'processing',
            );
            const twilioMessage = await createTwilioMessage(
                twilioClient,
                twilioPayload,
            );

            await store.messages.updateMessageDataByMessageId(
                messageData.message_id,
                messageData.direction,
                messageData.message_text,
                twilioMessage.status,
                twilioMessage.sid,
            );
        } catch (error) {
            console.error(
                `failed processing queued message ${queuedMessageId}:`,
                error,
            );

            try {
                await store.messages.updateMessageStatusByMessageId(
                    queuedMessageId,
                    'failed',
                );
            } catch (updateError) {
                console.error(
                    `failed updating DB status for message ${queuedMessageId}:`,
                    updateError,
                );
            }

            continue;
        }
    }
}
