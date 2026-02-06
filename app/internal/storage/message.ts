import { MessageRepository } from "./store";
import { MessageDirection } from "../shared/types/types";
import { PrismaClient } from "@/prisma/generated/prisma";

export default class PrismaMessageRepository implements MessageRepository {  

	constructor(private prismaClient: PrismaClient) {}

  async createMessage(
    conversationId: string,
    userId: string | null,
    direction: MessageDirection,
    messageText: string,
    messageStatus: string,
    twilioMessageSid: string
  ): Promise<boolean> {
    await this.prismaClient.messages.create({
      data: {
        conversation_id: conversationId,
        user_id: userId,
        direction,
        message_text: messageText,
        message_status: messageStatus,
        twilio_message_sid: twilioMessageSid,
      },
    })

    return true
  }

  async getMessage(): Promise<boolean> {
    return false
  }
}