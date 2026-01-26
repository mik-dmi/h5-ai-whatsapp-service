import { PrismaClient } from "@/prisma/generated/prisma/client";
import { UserRepository } from "./store";

export default class PrismaUserRepository implements UserRepository {  

	constructor(private prismaClient : PrismaClient) {}
  async createUser(): Promise<boolean> {
    return false
  }

  async getUser(): Promise<boolean> {
    
		return false

  }
  

}
