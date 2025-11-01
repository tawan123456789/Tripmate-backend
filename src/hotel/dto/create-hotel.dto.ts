import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  Min,
  Max,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHotelDto {
  // ใช้ id ของ UserService (Hotel.id = service_id)
  serviceId!: string;

  @IsString()
  name!: string;

  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsInt() @Min(1) @Max(5)
  star?: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  image?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  pictures?: string[];

  @IsOptional() @IsObject()
  facilities?: Record<string, any>;

  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(5)
  rating?: number;  // Prisma.Decimal(3,1)

  @IsOptional() @IsObject()
  subtopicRatings?: Record<string, any>;

  @IsOptional() @IsString()
  checkIn?: string;

  @IsOptional() @IsString()
  checkOut?: string;

  @IsOptional() @IsString()
  breakfast?: string;

  @IsOptional() @IsBoolean()
  petAllow?: boolean;

  @IsOptional() @IsString()
  contact?: string;

  @IsOptional() @IsString()
  locationSummary?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  nearbyLocations?: string[];

  @IsOptional() @IsString()
  facility?: string;  // legacy text (ใช้ในบางระบบเก่า)
}
