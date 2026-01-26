
import { PrismaClient } from "@/prisma/generated/prisma/client";
import { ConversationRepository } from "./store";

export default class PrismaConversationRepository implements ConversationRepository {  

	constructor(private prismaClient : PrismaClient) {}

  async createConversation(): Promise<boolean> {
	return false
  }
  async getConversation(): Promise<boolean> {
	return false
  }
}
