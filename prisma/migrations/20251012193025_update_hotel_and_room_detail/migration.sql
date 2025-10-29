-- AlterTable
ALTER TABLE "public"."Hotel" ADD COLUMN     "breakfast" TEXT,
ADD COLUMN     "checkIn" TEXT,
ADD COLUMN     "checkOut" TEXT,
ADD COLUMN     "contact" TEXT,
ADD COLUMN     "facilities" JSONB,
ADD COLUMN     "location_text" TEXT,
ADD COLUMN     "nearby_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "pet_allow" BOOLEAN,
ADD COLUMN     "pictures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "star" INTEGER,
ADD COLUMN     "subtopic_ratings" JSONB,
ADD COLUMN     "type" TEXT,
ALTER COLUMN "rating" SET DATA TYPE DECIMAL(3,1);

-- AlterTable
ALTER TABLE "public"."Room" ADD COLUMN     "facilities" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "name" TEXT,
ADD COLUMN     "pictures" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "size_sqm" INTEGER;
