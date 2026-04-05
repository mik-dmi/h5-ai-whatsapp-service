import { UserRepository } from '../repository';
import { PrismaDBClient } from '../storage';
import { users } from '@/prisma/generated/prisma';

export default class PrismaUserRepository implements UserRepository {
    constructor(private prismaClient: PrismaDBClient) {}
    async createUser(userNumber: string): Promise<users> {
        return this.prismaClient.users.create({
            data: {
                phone_number: userNumber,
            },
        });
    }

    async getUser(userNumber: string): Promise<users | null> {
        return this.prismaClient.users.findUnique({
            where: { phone_number: userNumber },
        });
    }
}
