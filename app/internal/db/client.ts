import "dotenv/config";
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from "@/prisma/generated/prisma/client";
import serverEnv from "../shared/env/env.server";

const connectionString = serverEnv.DATABASE_URL

const adapter = new PrismaPg({ connectionString })
const prismaClient = new PrismaClient({ adapter })

export { prismaClient }