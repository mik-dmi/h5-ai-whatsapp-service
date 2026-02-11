import { MessageRepository } from "./store";
import { MessageDirection } from "../shared/types/types";
import { messages, PrismaClient } from "@/prisma/generated/prisma";
import { AppErrors } from "../shared/errors/app-error";

export default class PrismaMessageRepository implements MessageRepository {  

	constructor(private prismaClient: PrismaClient) {}

  async createMessage(
    conversationId: string,
    userId: string | null,
    direction: MessageDirection,
    messageText: string,
    messageStatus: string,
    twilioMessageSid: string|null
  ): Promise<messages> {
    return await this.prismaClient.messages.create({
      data: {
        conversation_id: conversationId,
        user_id: userId,
        direction,
        message_text: messageText,
        message_status: messageStatus,
        twilio_message_sid: twilioMessageSid,
      },
    })
  }

  async getMessageBySid( messageSid : string ): Promise<messages | null> {
    
    return await this.prismaClient.messages.findUnique({
      where: { twilio_message_sid: messageSid}
    })
    
  }
  
  async updateMessageStatusBySid(messageSid : string , messageStatus : string ): Promise<boolean> {
    try {
      const res = await this.prismaClient.messages.updateMany({ // updateMany and not just update as I dont want to send an error in case of there message not existing in the db
        where: { twilio_message_sid: messageSid },
        data: { 
          message_status: messageStatus,
         },
      });
      return res.count > 0;
    } catch (e) {
      throw new AppErrors(503, "DbError", "Failed to update message status", { messageSid, cause: e });
    }
  }

async updateMessageDataByMessageId(
  messageId: bigint,
  direction: MessageDirection,
  payload: string,
  status: string,
  messageSid: string | null
): Promise<messages> {
  try {
    return await this.prismaClient.messages.update({
      where: { message_id: messageId },
      data: {
        direction,
        message_text: payload,
        message_status: status,
        twilio_message_sid: messageSid,
      },
    });
  } catch (e) {
    throw new AppErrors(503, "DbError", "Failed to update message data by messageId", { messageId, cause: e });
  }
}
}