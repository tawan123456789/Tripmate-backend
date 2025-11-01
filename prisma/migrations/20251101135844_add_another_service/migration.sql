/*
  Warnings:

  - The `another_services` column on the `CarRentalCenter` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."CarRentalCenter" DROP COLUMN "another_services",
ADD COLUMN     "another_services" JSONB[] DEFAULT ARRAY[]::JSONB[];
