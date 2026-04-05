import { PrismaDBClient } from '../storage';
import { MessageDirection } from '../../shared/types/types';
import {
    messages,
    MessageStatus as MessageStatusInDB,
} from '@/prisma/generated/prisma';
import { MessageRepository } from '../repository';

export default class PrismaMessageRepository implements MessageRepository {
    constructor(private prismaClient: PrismaDBClient) {}

    async createMessage(
        conversationId: string,
        userId: string | null,
        direction: MessageDirection,
        messageText: string,
        messageStatus: MessageStatusInDB,
        twilioMessageSid: string | null,
    ): Promise<messages> {
        return await this.prismaClient.messages.create({
            data: {
                conversation_id: conversationId,
                user_id: userId,
                direction,
                message_text: messageText,
                message_status: messageStatus,
                twilio_message_sid: twilioMessageSid,
            },
        });
    }

    async getMessageBySid(messageSid: string): Promise<messages | null> {
        return await this.prismaClient.messages.findUnique({
            where: { twilio_message_sid: messageSid },
        });
    }

    async updateMessageStatusBySid(
        messageSid: string,
        messageStatus: MessageStatusInDB,
    ): Promise<boolean> {
        const res = await this.prismaClient.messages.updateMany({
            // updateMany and not just update as I dont want to send an error in case of there message not existing in the db
            where: { twilio_message_sid: messageSid },
            data: {
                message_status: messageStatus,
            },
        });
        return res.count > 0;
    }

    async updateMessageDataByMessageId(
        messageId: string,
        direction: MessageDirection | null,
        payload: string | null,
        status: MessageStatusInDB,
        twilioMessageSid: string | null,
    ): Promise<messages> {
        return await this.prismaClient.messages.update({
            where: { message_id: messageId },
            data: {
                direction,
                message_text: payload,
                message_status: status,
                twilio_message_sid: twilioMessageSid,
            },
        });
    }
}
