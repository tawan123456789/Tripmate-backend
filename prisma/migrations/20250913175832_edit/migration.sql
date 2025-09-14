/*
  Warnings:

  - The primary key for the `Location` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Place` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."Place" DROP CONSTRAINT "Place_location_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripUnit" DROP CONSTRAINT "TripUnit_place_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserService" DROP CONSTRAINT "UserService_location_id_fkey";

-- AlterTable
ALTER TABLE "public"."Location" DROP CONSTRAINT "Location_pkey",
ALTER COLUMN "location_id" DROP DEFAULT,
ALTER COLUMN "location_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Location_pkey" PRIMARY KEY ("location_id");
DROP SEQUENCE "Location_location_id_seq";

-- AlterTable
ALTER TABLE "public"."Place" DROP CONSTRAINT "Place_pkey",
ALTER COLUMN "place_id" DROP DEFAULT,
ALTER COLUMN "place_id" SET DATA TYPE TEXT,
ALTER COLUMN "location_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Place_pkey" PRIMARY KEY ("place_id");
DROP SEQUENCE "Place_place_id_seq";

-- AlterTable
ALTER TABLE "public"."TripUnit" ALTER COLUMN "place_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "public"."UserService" ALTER COLUMN "location_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."TripUnit" ADD CONSTRAINT "TripUnit_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Place" ADD CONSTRAINT "Place_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserService" ADD CONSTRAINT "UserService_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;
