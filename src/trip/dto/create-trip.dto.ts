import { IsString, IsOptional, IsDateString, ValidateNested, IsArray, IsUUID, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// Original CreateTripDto declaration removed

export enum TripEventType {
  Place = 'place',
  Service = 'service',
}

// ---- Trip Event DTO ----
export class CreateTripEventDto {
  
  @IsOptional()
  @IsEnum(TripEventType)
  @ApiPropertyOptional({ enum: TripEventType, default: TripEventType.Place })
  type?: TripEventType = TripEventType.Place;

  // placeId can be a place id (pl-xxx) or a service id (crc_...) depending on type
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  placeId?: string;

  @IsDateString()
  @ApiProperty()
  startAt: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @ApiPropertyOptional()
  durationMinutes?: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  note?: string;
}

// ---- Day DTO ----
export class CreateTripPlanDayDto {
  @IsInt()
  @Min(1)
  @ApiProperty()
  dayNumber: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  accommodationId?: string | null;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  guideId?: string | null;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  date?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTripEventDto)
  @ApiProperty({ type: [CreateTripEventDto] })
  events: CreateTripEventDto[];
}

// ---- Create Plan DTO ----
export class CreateTripPlanDto {
  @IsUUID()
  @ApiProperty()
  ownerId: string;

  @IsString()
  @ApiProperty()
  tripName: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  tripImg?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  status?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  note?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  @ApiPropertyOptional()
  endDate?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTripPlanDayDto)
  @ApiProperty({ type: [CreateTripPlanDayDto] })
  days: CreateTripPlanDayDto[];
}

export class CreateTripDto extends CreateTripPlanDto {}
