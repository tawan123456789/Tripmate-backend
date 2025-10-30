-- Create TripService table to match prisma model

CREATE TABLE "TripService" (
  "trip_service_id" text PRIMARY KEY,
  "trip_id" text NOT NULL,
  "service_id" text NOT NULL,
  "date_time" timestamp without time zone NOT NULL,
  "status" text,
  "created_at" timestamp without time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp without time zone
);

-- Foreign keys (assumes TripPlan.trip_id and UserService.service_id exist and are text)
ALTER TABLE "TripService" ADD CONSTRAINT fk_tripservice_trip FOREIGN KEY ("trip_id") REFERENCES "TripPlan" ("trip_id") ON DELETE CASCADE;
ALTER TABLE "TripService" ADD CONSTRAINT fk_tripservice_service FOREIGN KEY ("service_id") REFERENCES "UserService" ("service_id") ON DELETE CASCADE;

CREATE INDEX "idx_tripservice_trip_id" ON "TripService" ("trip_id");
CREATE INDEX "idx_tripservice_service_id" ON "TripService" ("service_id");
