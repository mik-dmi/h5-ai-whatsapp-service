import { PrismaClient } from "@/prisma/generated/prisma/client";
import { MessageRepository } from "./store";

export default class PrismaMessageRepository implements MessageRepository {  

	constructor(private prismaClient : PrismaClient) {}

  async createMessage(): Promise<boolean> {
	// Prisma logic
	return false 
  }
  async getMessage(): Promise<boolean> {
	// Prisma logic
	return false
  }

}
