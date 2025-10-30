/*
  Warnings:

  - You are about to drop the column `deleted_at` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Car` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `Guide` table. All the data in the column will be lost.
  - You are about to alter the column `rating` on the `Restaurant` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(3,1)`.

*/
-- AlterTable
ALTER TABLE "public"."Car" DROP COLUMN "deleted_at",
DROP COLUMN "status",
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "currency" TEXT DEFAULT 'THB',
ADD COLUMN     "deposit" DECIMAL(10,2),
ADD COLUMN     "doors" INTEGER,
ADD COLUMN     "features" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fuelType" TEXT,
ADD COLUMN     "insurance" JSONB,
ADD COLUMN     "luggage" INTEGER,
ADD COLUMN     "mileage_limit_km" INTEGER,
ADD COLUMN     "pictures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "price_per_hour" DECIMAL(10,2),
ADD COLUMN     "transmission" TEXT,
ADD COLUMN     "year" INTEGER,
ALTER COLUMN "created_at" DROP NOT NULL,
ALTER COLUMN "created_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "public"."CarRentalCenter" ADD COLUMN     "branches" JSONB,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "contacts" JSONB,
ADD COLUMN     "facilities" JSONB,
ADD COLUMN     "facility" TEXT,
ADD COLUMN     "location_text" TEXT,
ADD COLUMN     "nearby_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "opening_hours" JSONB,
ADD COLUMN     "payment_methods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pickup_dropoff" JSONB,
ADD COLUMN     "pictures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "policies" JSONB,
ADD COLUMN     "required_docs" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subtopic_ratings" JSONB,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(3,1);

-- AlterTable
ALTER TABLE "public"."Guide" DROP COLUMN "language",
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "contacts" JSONB,
ADD COLUMN     "currency" TEXT DEFAULT 'THB',
ADD COLUMN     "day_rate" DECIMAL(10,2),
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "hourly_rate" DECIMAL(10,2),
ADD COLUMN     "languages" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "license_id" TEXT,
ADD COLUMN     "location_text" TEXT,
ADD COLUMN     "nearby_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "overtime_rate" DECIMAL(10,2),
ADD COLUMN     "pictures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "policies" JSONB,
ADD COLUMN     "regionsCovered" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subtopic_ratings" JSONB,
ADD COLUMN     "verified" BOOLEAN DEFAULT false,
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(3,1);

-- AlterTable
ALTER TABLE "public"."Restaurant" ADD COLUMN     "contact" TEXT,
ADD COLUMN     "contacts" JSONB,
ADD COLUMN     "cuisine" TEXT,
ADD COLUMN     "dietaryTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "facilities" JSONB,
ADD COLUMN     "facility" TEXT,
ADD COLUMN     "location_text" TEXT,
ADD COLUMN     "nearby_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "opening_hours" JSONB,
ADD COLUMN     "payment_methods" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pet_allow" BOOLEAN,
ADD COLUMN     "pictures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "reservation_policy" JSONB,
ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "subtopic_ratings" JSONB,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(3,1);
