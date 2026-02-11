import PrismaUserRepository from "./user"
import PrismaConversationRepository from "./conversation"
import PrismaMessageRepository from "./message"
import { conversations, messages, PrismaClient, users } from "@/prisma/generated/prisma"
import { MessageDirection } from "../shared/types/types"

export  interface  UserRepository {
	createUser(userNumber : string): Promise<users>
	getUser(userNumber : string ): Promise<users | null>
}
export  interface  ConversationRepository {
	createConversation(userId : string):Promise<conversations >
	getOpenConversation(userId : string):Promise<conversations | null>
}
export  interface  MessageRepository {
	createMessage(conversationId: string,
		userId: string | null,
		direction: MessageDirection,
		messageText: string,
		messageStatus: string,
	twilioMessageSid: string | null):Promise<messages>
	getMessageBySid( messageSid : string ): Promise<messages | null>
	updateMessageStatusBySid(messageSid : string , newMessageStatus : string): Promise<boolean> 
	updateMessageDataByMessageId(messageId: bigint, direction: string, payload :string , status: string , message_sid : string | null): Promise<messages>
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

//30 mins 


