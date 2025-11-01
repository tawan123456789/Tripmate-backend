/*
  Warnings:

  - You are about to drop the column `image` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `contact` on the `CarRentalCenter` table. All the data in the column will be lost.
  - You are about to drop the column `facility` on the `CarRentalCenter` table. All the data in the column will be lost.
  - You are about to drop the column `location_text` on the `CarRentalCenter` table. All the data in the column will be lost.
  - You are about to drop the column `pickup_dropoff` on the `CarRentalCenter` table. All the data in the column will be lost.
  - You are about to drop the column `policies` on the `CarRentalCenter` table. All the data in the column will be lost.
  - You are about to drop the column `facility` on the `Hotel` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Hotel` table. All the data in the column will be lost.
  - The `place_img` column on the `Place` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `bed_type` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `person_per_room` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `price_per_night` on the `Room` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "image",
ADD COLUMN     "fuel_policy" TEXT,
ADD COLUMN     "pickup_location" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "public"."CarRentalCenter" DROP COLUMN "contact",
DROP COLUMN "facility",
DROP COLUMN "location_text",
DROP COLUMN "pickup_dropoff",
DROP COLUMN "policies",
ADD COLUMN     "another_services" JSONB;

-- AlterTable
ALTER TABLE "public"."Hotel" DROP COLUMN "facility",
DROP COLUMN "image";

-- AlterTable
ALTER TABLE "public"."Place" DROP COLUMN "place_img",
ADD COLUMN     "place_img" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "public"."Room" DROP COLUMN "bed_type",
DROP COLUMN "image",
DROP COLUMN "person_per_room",
DROP COLUMN "price_per_night",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."RoomOption" (
    "room_option_id" TEXT NOT NULL,
    "room_id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bed" TEXT,
    "max_guest" INTEGER,
    "price" DECIMAL(10,2),

    CONSTRAINT "RoomOption_pkey" PRIMARY KEY ("room_option_id")
);

-- CreateIndex
CREATE INDEX "RoomOption_room_id_hotel_id_idx" ON "public"."RoomOption"("room_id", "hotel_id");

-- CreateIndex
CREATE UNIQUE INDEX "RoomOption_room_id_hotel_id_name_key" ON "public"."RoomOption"("room_id", "hotel_id", "name");

-- AddForeignKey
ALTER TABLE "public"."RoomOption" ADD CONSTRAINT "RoomOption_room_id_hotel_id_fkey" FOREIGN KEY ("room_id", "hotel_id") REFERENCES "public"."Room"("room_id", "hotel_id") ON DELETE CASCADE ON UPDATE CASCADE;
