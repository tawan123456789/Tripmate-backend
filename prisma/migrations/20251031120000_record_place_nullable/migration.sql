-- This migration records that TripUnit.place_id is nullable; DB change was applied manually.
-- We mark this migration as applied so Prisma's migration history matches the DB.

ALTER TABLE "TripUnit" ALTER COLUMN "place_id" DROP NOT NULL;
