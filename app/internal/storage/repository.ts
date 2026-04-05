import {
    conversations,
    messages,
    MessageStatus as MessageStatusInDB,
    users,
} from '@/prisma/generated/prisma';
import { MessageDirection } from '../shared/types/types';
import PrismaUserRepository from './repositories/user';
import PrismaConversationRepository from './repositories/conversation';
import { PrismaDBClient } from './storage';
import PrismaMessageRepository from './repositories/message';

export interface UserRepository {
    createUser(userNumber: string): Promise<users>;
    getUser(userNumber: string): Promise<users | null>;
}
export interface ConversationRepository {
    createConversation(userId: string): Promise<conversations>;
    getOpenConversation(userId: string): Promise<conversations | null>;
}
export interface MessageRepository {
    createMessage(
        conversationId: string,
        userId: string | null,
        direction: MessageDirection,
        messageText: string,
        messageStatus: MessageStatusInDB,
        twilioMessageSid: string | null,
    ): Promise<messages>;
    getMessageBySid(messageSid: string): Promise<messages | null>;
    updateMessageStatusBySid(
        messageSid: string,
        newMessageStatus: MessageStatusInDB,
    ): Promise<boolean>;
    updateMessageDataByMessageId(
        messageId: string,
        direction: string | null,
        payload: string | null,
        status: MessageStatusInDB,
        twilioMessageSid: string | null,
    ): Promise<messages>;
}

export interface Repositories {
    users: UserRepository;
    conversations: ConversationRepository;
    messages: MessageRepository;
}

//assemble repo objects around a DB client or tx client
export function createPrismaRepositories(client: PrismaDBClient): Repositories {
    return {
        users: new PrismaUserRepository(client),
        conversations: new PrismaConversationRepository(client),
        messages: new PrismaMessageRepository(client),
    };
}
