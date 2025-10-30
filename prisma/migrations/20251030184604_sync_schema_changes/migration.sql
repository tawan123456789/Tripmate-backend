-- DropForeignKey
ALTER TABLE "public"."TripService" DROP CONSTRAINT "fk_tripservice_service";

-- DropForeignKey
ALTER TABLE "public"."TripService" DROP CONSTRAINT "fk_tripservice_trip";

-- DropForeignKey
ALTER TABLE "public"."TripUnit" DROP CONSTRAINT "TripUnit_place_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."TripUnit" DROP CONSTRAINT "TripUnit_service_id_fkey";

-- AlterTable
ALTER TABLE "public"."TripService" ALTER COLUMN "date_time" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "public"."TripUnit" ADD CONSTRAINT "TripUnit_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("place_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripUnit" ADD CONSTRAINT "TripUnit_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."Booking"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripService" ADD CONSTRAINT "TripService_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."TripPlan"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripService" ADD CONSTRAINT "TripService_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "public"."idx_tripservice_service_id" RENAME TO "TripService_service_id_idx";

-- RenameIndex
ALTER INDEX "public"."idx_tripservice_trip_id" RENAME TO "TripService_trip_id_idx";
