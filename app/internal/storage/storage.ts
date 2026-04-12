import { messages, Prisma, PrismaClient } from '@/prisma/generated/prisma';
import { TwilioMessageTemplateData } from '../services/twilio/create-message/service';
import { PrismaStorage } from './prisma-storage';
import { Repositories } from './repository';

export type PrismaDBClient = PrismaClient | Prisma.TransactionClient;

export interface Storage extends Repositories {
    createOutboundMessageForQueue(
        twilioMessageTemplate: TwilioMessageTemplateData,
        whatsAppNumber: string,
    ): Promise<messages>;
}

// higher-level storage facade with transactional behavior
export function createPrismaStorage(prisma: PrismaClient): Storage {
    return new PrismaStorage(prisma);
}
