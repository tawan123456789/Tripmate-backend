/*
  Warnings:

  - The primary key for the `GroupUserPayment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `group_user_payment_id` to the `GroupUserPayment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."GroupUserPayment" DROP CONSTRAINT "GroupUserPayment_pkey",
ADD COLUMN     "group_user_payment_id" TEXT NOT NULL,
ADD CONSTRAINT "GroupUserPayment_pkey" PRIMARY KEY ("group_user_payment_id");

-- CreateIndex
CREATE INDEX "GroupUserPayment_group_id_user_id_idx" ON "public"."GroupUserPayment"("group_id", "user_id");
