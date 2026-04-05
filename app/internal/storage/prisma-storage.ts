import { messages, PrismaClient } from '@/prisma/generated/prisma';
import PrismaUserRepository from './repositories/user';
import PrismaConversationRepository from './repositories/conversation';
import PrismaMessageRepository from './repositories/message';
import { TwilioMessageTemplateData } from '../services/twilio/create-message/service';
import { MessageDirection } from '../shared/types/types';
import {
    ConversationRepository,
    createPrismaRepositories,
    MessageRepository,
    UserRepository,
} from './repository';
import { Storage } from './storage';

export class PrismaStorage implements Storage {
    public users: UserRepository;
    public conversations: ConversationRepository;
    public messages: MessageRepository;

    constructor(private prisma: PrismaClient) {
        this.users = new PrismaUserRepository(prisma);
        this.conversations = new PrismaConversationRepository(prisma);
        this.messages = new PrismaMessageRepository(prisma);
    }

    async createOutboundMessageForQueue(
        twilioMessageTemplate: TwilioMessageTemplateData,
    ): Promise<messages> {
        return this.prisma.$transaction(async (tx) => {
            const txRepos = createPrismaRepositories(tx);
            const userWhatsappNumber = twilioMessageTemplate.to;

            let storedUser = await txRepos.users.getUser(userWhatsappNumber);

            if (storedUser === null) {
                storedUser = await txRepos.users.createUser(userWhatsappNumber);
            }

            let conversation = await txRepos.conversations.getOpenConversation(
                storedUser.user_id,
            );

            if (conversation === null) {
                conversation = await txRepos.conversations.createConversation(
                    storedUser.user_id,
                );
            }

            return txRepos.messages.createMessage(
                conversation.conversation_id,
                storedUser.user_id,
                MessageDirection.OUTBOUND,
                JSON.stringify(twilioMessageTemplate),
                'pre_in_memory_queue',
                null,
            );
        });
    }
}
