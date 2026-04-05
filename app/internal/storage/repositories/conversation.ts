import { ConversationRepository } from '../repository';
import { PrismaDBClient } from '../storage';
import { conversations } from '@/prisma/generated/prisma';

export default class PrismaConversationRepository implements ConversationRepository {
    constructor(private prisma: PrismaDBClient) {}

    async getOpenConversation(userId: string): Promise<conversations | null> {
        return this.prisma.conversations.findFirst({
            where: {
                user_id: userId,
                is_open: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });
    }

    async createConversation(userId: string): Promise<conversations> {
        return this.prisma.conversations.create({
            data: {
                user_id: userId,
                is_open: true,
            },
        });
    }
}
