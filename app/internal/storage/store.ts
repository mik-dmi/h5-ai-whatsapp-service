import { PrismaClient } from "@/prisma/generated/prisma/client"
import PrismaRepository from "./user"
import PrismaUserRepository from "./user"
import PrismaConversationRepository from "./conversation"
import PrismaMessageRepository from "./message"

export  interface  UserRepository {
	createUser(): Promise<boolean>
	getUser(): Promise<boolean>
}
export  interface  ConversationRepository {
	createConversation():Promise<boolean>
	getConversation():Promise<boolean>
}
export  interface  MessageRepository {
	createMessage():Promise<boolean>
	getMessage():Promise<boolean>
}

export interface Repositories {
  users: UserRepository
  conversations: ConversationRepository
  messages: MessageRepository
}


export function NewPrismaStorage(client : PrismaClient ) : Repositories{

	return {
		users: new PrismaUserRepository(client),
		conversations: new PrismaConversationRepository(client),
		messages: new PrismaMessageRepository(client),

	}


}




