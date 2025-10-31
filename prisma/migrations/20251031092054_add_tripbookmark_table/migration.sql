/*
  Warnings:

  - You are about to drop the column `description` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `metadata` on the `Transaction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Bookmark" ADD COLUMN     "trip_id" TEXT,
ALTER COLUMN "service_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transaction" DROP COLUMN "description",
DROP COLUMN "metadata";

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."TripPlan"("trip_id") ON DELETE SET NULL ON UPDATE CASCADE;
