import { IsString, IsOptional, IsDateString, ValidateNested, IsArray, IsUUID, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTripDto {}

export enum TripEventType {
  Place = 'place',
  Service = 'service',
}

// ---- Trip Event DTO ----
export class CreateTripEventDto {
  @IsOptional()
  @IsEnum(TripEventType)
  type?: TripEventType = TripEventType.Place;

  // placeId can be a place id (pl-xxx) or a service id (crc_...) depending on type
  @IsOptional()
  @IsString()
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

  @IsOptional()
  @IsString()
  accommodationId?: string | null;

  @IsOptional()
  @IsString()
  guideId?: string | null;

  @IsOptional()
  @IsDateString()
  date?: string;

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
