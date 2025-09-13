-- CreateTable
CREATE TABLE "public"."User" (
    "user_id" UUID NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "birth_date" DATE,
    "role" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profile_img" TEXT,
    "phone" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "public"."Group" (
    "group_id" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "group_name" TEXT NOT NULL,
    "group_img" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "trip_plans_id" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("group_id")
);

-- CreateTable
CREATE TABLE "public"."UserJoinGroup" (
    "group_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "status" TEXT,
    "join_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserJoinGroup_pkey" PRIMARY KEY ("group_id","user_id")
);

-- CreateTable
CREATE TABLE "public"."TripPlan" (
    "trip_id" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3),
    "delete_at" TIMESTAMP(3),
    "trip_name" TEXT NOT NULL,
    "trip_img" TEXT,
    "status" TEXT,
    "note" TEXT,
    "start_date" DATE,
    "end_date" DATE,

    CONSTRAINT "TripPlan_pkey" PRIMARY KEY ("trip_id")
);

-- CreateTable
CREATE TABLE "public"."TripUnit" (
    "unit_id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "place_id" INTEGER NOT NULL,
    "time_stamp_start" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER,
    "status" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "TripUnit_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "public"."Place" (
    "place_id" SERIAL NOT NULL,
    "location_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "place_img" TEXT,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "public"."Location" (
    "location_id" SERIAL NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "long" DOUBLE PRECISION NOT NULL,
    "name" TEXT NOT NULL,
    "detail" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "country" TEXT,
    "province" TEXT,
    "address" TEXT,
    "district" TEXT,
    "street" TEXT,
    "zip_code" TEXT,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("location_id")
);

-- CreateTable
CREATE TABLE "public"."UserService" (
    "service_id" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "location_id" INTEGER,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "service_img" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "type" TEXT,

    CONSTRAINT "UserService_pkey" PRIMARY KEY ("service_id")
);

-- CreateTable
CREATE TABLE "public"."Hotel" (
    "hotel_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "facility" TEXT,
    "rating" DECIMAL(2,1),
    "image" TEXT,

    CONSTRAINT "Hotel_pkey" PRIMARY KEY ("hotel_id")
);

-- CreateTable
CREATE TABLE "public"."Room" (
    "room_id" TEXT NOT NULL,
    "hotel_id" TEXT NOT NULL,
    "price_per_night" DECIMAL(10,2),
    "bed_type" TEXT,
    "person_per_room" INTEGER,
    "description" TEXT,
    "image" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("room_id")
);

-- CreateTable
CREATE TABLE "public"."Guide" (
    "guide_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "rating" DECIMAL(2,1),

    CONSTRAINT "Guide_pkey" PRIMARY KEY ("guide_id")
);

-- CreateTable
CREATE TABLE "public"."CarRentalCenter" (
    "crc_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "rating" DECIMAL(2,1),

    CONSTRAINT "CarRentalCenter_pkey" PRIMARY KEY ("crc_id")
);

-- CreateTable
CREATE TABLE "public"."Car" (
    "car_id" TEXT NOT NULL,
    "crc_id" TEXT NOT NULL,
    "price_per_day" DECIMAL(10,2),
    "model" TEXT,
    "description" TEXT,
    "carseat" INTEGER,
    "image" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Car_pkey" PRIMARY KEY ("car_id")
);

-- CreateTable
CREATE TABLE "public"."Restaurant" (
    "restaurant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "menu" TEXT,
    "image" TEXT,
    "rating" DECIMAL(2,1),

    CONSTRAINT "Restaurant_pkey" PRIMARY KEY ("restaurant_id")
);

-- CreateTable
CREATE TABLE "public"."Table" (
    "table_id" TEXT NOT NULL,
    "restaurant_id" TEXT NOT NULL,
    "model" TEXT,
    "description" TEXT,
    "seat" INTEGER,
    "price_per_seat" DECIMAL(10,2),
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Table_pkey" PRIMARY KEY ("table_id")
);

-- CreateTable
CREATE TABLE "public"."Review" (
    "review_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "comment" TEXT,
    "score" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "status" TEXT,
    "image" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("review_id")
);

-- CreateTable
CREATE TABLE "public"."Bookmark" (
    "bookmark_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "status" TEXT,

    CONSTRAINT "Bookmark_pkey" PRIMARY KEY ("bookmark_id")
);

-- CreateTable
CREATE TABLE "public"."Booking" (
    "booking_id" TEXT NOT NULL,
    "service_id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "start_booking_date" TIMESTAMP(3) NOT NULL,
    "end_booking_date" TIMESTAMP(3),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "status" TEXT,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "public"."Discount" (
    "discount_id" TEXT NOT NULL,
    "owner_id" UUID NOT NULL,
    "value" DECIMAL(10,2),
    "type" TEXT,
    "status" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expired_at" TIMESTAMP(3),
    "maker_id" UUID,

    CONSTRAINT "Discount_pkey" PRIMARY KEY ("discount_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE INDEX "Group_owner_id_idx" ON "public"."Group"("owner_id");

-- CreateIndex
CREATE INDEX "TripPlan_owner_id_idx" ON "public"."TripPlan"("owner_id");

-- CreateIndex
CREATE INDEX "TripUnit_trip_id_idx" ON "public"."TripUnit"("trip_id");

-- CreateIndex
CREATE INDEX "TripUnit_place_id_idx" ON "public"."TripUnit"("place_id");

-- CreateIndex
CREATE INDEX "Place_location_id_idx" ON "public"."Place"("location_id");

-- CreateIndex
CREATE INDEX "UserService_owner_id_idx" ON "public"."UserService"("owner_id");

-- CreateIndex
CREATE INDEX "UserService_location_id_idx" ON "public"."UserService"("location_id");

-- CreateIndex
CREATE INDEX "Room_hotel_id_idx" ON "public"."Room"("hotel_id");

-- CreateIndex
CREATE INDEX "Car_crc_id_idx" ON "public"."Car"("crc_id");

-- CreateIndex
CREATE INDEX "Table_restaurant_id_idx" ON "public"."Table"("restaurant_id");

-- CreateIndex
CREATE INDEX "Review_service_id_idx" ON "public"."Review"("service_id");

-- CreateIndex
CREATE INDEX "Review_user_id_idx" ON "public"."Review"("user_id");

-- CreateIndex
CREATE INDEX "Bookmark_service_id_idx" ON "public"."Bookmark"("service_id");

-- CreateIndex
CREATE INDEX "Bookmark_user_id_idx" ON "public"."Bookmark"("user_id");

-- CreateIndex
CREATE INDEX "Booking_service_id_idx" ON "public"."Booking"("service_id");

-- CreateIndex
CREATE INDEX "Booking_group_id_idx" ON "public"."Booking"("group_id");

-- CreateIndex
CREATE INDEX "Discount_owner_id_idx" ON "public"."Discount"("owner_id");

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_trip_plans_id_fkey" FOREIGN KEY ("trip_plans_id") REFERENCES "public"."TripPlan"("trip_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserJoinGroup" ADD CONSTRAINT "UserJoinGroup_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."Group"("group_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserJoinGroup" ADD CONSTRAINT "UserJoinGroup_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripPlan" ADD CONSTRAINT "TripPlan_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripUnit" ADD CONSTRAINT "TripUnit_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "public"."TripPlan"("trip_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TripUnit" ADD CONSTRAINT "TripUnit_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "public"."Place"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Place" ADD CONSTRAINT "Place_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserService" ADD CONSTRAINT "UserService_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserService" ADD CONSTRAINT "UserService_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "public"."Location"("location_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Hotel" ADD CONSTRAINT "Hotel_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Room" ADD CONSTRAINT "Room_hotel_id_fkey" FOREIGN KEY ("hotel_id") REFERENCES "public"."Hotel"("hotel_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Guide" ADD CONSTRAINT "Guide_guide_id_fkey" FOREIGN KEY ("guide_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CarRentalCenter" ADD CONSTRAINT "CarRentalCenter_crc_id_fkey" FOREIGN KEY ("crc_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Car" ADD CONSTRAINT "Car_crc_id_fkey" FOREIGN KEY ("crc_id") REFERENCES "public"."CarRentalCenter"("crc_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Restaurant" ADD CONSTRAINT "Restaurant_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Table" ADD CONSTRAINT "Table_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "public"."Restaurant"("restaurant_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."UserService"("service_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Bookmark" ADD CONSTRAINT "Bookmark_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."User"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."UserService"("service_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."Group"("group_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "public"."User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Discount" ADD CONSTRAINT "Discount_maker_id_fkey" FOREIGN KEY ("maker_id") REFERENCES "public"."User"("user_id") ON DELETE SET NULL ON UPDATE CASCADE;
