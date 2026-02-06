import { UserRepository } from "./store";
import { PrismaClient, users } from "@/prisma/generated/prisma";

export default class PrismaUserRepository implements UserRepository {  

	constructor(private prismaClient : PrismaClient) {}
  async createUser(userNumber : string ): Promise<users> {

    return  this.prismaClient.users.create({
			data: {
				phone_number: userNumber,
			}
		})


  }

async getUser(userNumber: string): Promise<users | null> {
    return this.prismaClient.users.findUnique({
      where: { phone_number: userNumber },
    });
  }
}
