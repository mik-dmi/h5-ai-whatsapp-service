/*
  Warnings:

  - The primary key for the `messages` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `message_id` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `message_status` column on the `messages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[twilio_message_sid]` on the table `messages` will be added. If there are existing duplicate values, this will fail.
  - Made the column `created_at` on table `messages` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('pre_in_memory_queue', 'failed_to_queue', 'processing', 'queued', 'sending', 'sent', 'failed', 'delivered', 'undelivered', 'receiving', 'received', 'accepted', 'scheduled', 'read', 'partially_delivered', 'canceled');

-- AlterTable
ALTER TABLE "messages" DROP CONSTRAINT "messages_pkey",
DROP COLUMN "message_id",
ADD COLUMN     "message_id" UUID NOT NULL DEFAULT gen_random_uuid(),
DROP COLUMN "message_status",
ADD COLUMN     "message_status" "MessageStatus" NOT NULL DEFAULT 'pre_in_memory_queue',
ALTER COLUMN "created_at" SET NOT NULL,
ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("message_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_twilio_message_sid_key" ON "messages"("twilio_message_sid");
