/*
  Warnings:

  - The primary key for the `Room` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."Room" DROP CONSTRAINT "Room_pkey",
ADD CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id", "hotel_id");
