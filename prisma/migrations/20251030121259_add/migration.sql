-- AlterTable
ALTER TABLE "public"."TripUnit" ADD COLUMN     "service_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."TripUnit" ADD CONSTRAINT "TripUnit_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."UserService"("service_id") ON DELETE SET NULL ON UPDATE CASCADE;
