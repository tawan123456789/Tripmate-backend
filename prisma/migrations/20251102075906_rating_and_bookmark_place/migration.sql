/*
  Warnings:

  - Added the required column `place_id` to the `Bookmark` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Bookmark" ADD COLUMN     "place_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."Review" ADD COLUMN     "rating" INTEGER;

-- CreateIndex
CREATE INDEX "Bookmark_place_id_idx" ON "public"."Bookmark"("place_id");

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("place_id") ON DELETE CASCADE ON UPDATE CASCADE;
