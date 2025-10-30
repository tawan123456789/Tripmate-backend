import {
  IsString,
  IsOptional,
  IsDateString,
  ValidateNested,
  IsArray,
  IsUUID,
  IsInt,
  Min,
  IsEnum,
  IsNumber,
  IsObject
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripDto {}

export enum TripEventType {
  VISIT = 'visit',
  RESTAURANT_BOOKING = 'restaurant_booking',
  TRANSPORT = 'transport',
  NOTE = 'note',
}

// ---- Trip Event DTO ----
export class CreateTripEventDto {
  @IsOptional()
  @IsEnum(TripEventType)
  type?: TripEventType = TripEventType.VISIT;

  @IsOptional()
  @IsUUID()
  placeId?: string;

  @IsDateString()
  startAt: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

// ---- Day DTO ----
export class CreateTripPlanDayDto {
  @IsInt()
  @Min(1)
  dayNumber: number;

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTripEventDto)
  events: CreateTripEventDto[];
}

// ---- Create Plan DTO ----
export class CreateTripPlanDto {
  @IsUUID()
  ownerId: string;

  @IsString()
  tripName: string;

  @IsOptional()
  @IsString()
  tripImg?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTripPlanDayDto)
  days: CreateTripPlanDayDto[];
}

// model TripPlan {
//   id        String    @id @map("trip_id")
//   ownerId   String    @map("owner_id") @db.Uuid
//   createAt  DateTime  @default(now()) @map("create_at")
//   updateAt  DateTime? @updatedAt @map("update_at")
//   deleteAt  DateTime? @map("delete_at")
//   tripName  String    @map("trip_name")
//   tripImg   String?   @map("trip_img")
//   status    String?
//   note      String?
//   startDate DateTime? @map("start_date") @db.Date
//   endDate   DateTime? @map("end_date") @db.Date

//   owner  User       @relation("TripPlanOwner", fields: [ownerId], references: [id])
//   units  TripUnit[]
//   groups Group[]

//   @@index([ownerId])
//   @@map("TripPlan")
// }

// model TripUnit {
//   id             String    @id @map("unit_id")
//   tripId         String    @map("trip_id")
//   placeId        String    @map("place_id")
//   timeStampStart DateTime  @map("time_stamp_start")
//   duration       Int?
//   status         String?
//   note           String?
//   createdAt      DateTime  @default(now()) @map("created_at")
//   updatedAt      DateTime? @updatedAt @map("updated_at")
//   deletedAt      DateTime? @map("deleted_at")

//   trip  TripPlan @relation(fields: [tripId], references: [id], onDelete: Cascade)
//   place Place    @relation(fields: [placeId], references: [id])

//   @@index([tripId])
//   @@index([placeId])
//   @@map("TripUnit")
// }