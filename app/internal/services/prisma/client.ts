
import { PrismaClient } from '@/prisma/generated/prisma'
import serverEnv from '../../shared/env/env.server'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: serverEnv.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })