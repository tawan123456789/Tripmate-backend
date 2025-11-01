/*
  Warnings:

  - You are about to drop the column `score` on the `Review` table. All the data in the column will be lost.
  - The `image` column on the `Review` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."Review" DROP COLUMN "score",
ADD COLUMN     "location_id" TEXT,
ADD COLUMN     "score1" INTEGER,
ADD COLUMN     "score2" INTEGER,
ADD COLUMN     "score3" INTEGER,
ADD COLUMN     "score4" INTEGER,
ADD COLUMN     "score5" INTEGER,
ADD COLUMN     "score6" INTEGER,
ALTER COLUMN "service_id" DROP NOT NULL,
DROP COLUMN "image",
ADD COLUMN     "image" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."Place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;
