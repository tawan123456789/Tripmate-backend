-- make TripUnit.place_id nullable
ALTER TABLE "TripUnit" ALTER COLUMN "place_id" DROP NOT NULL;