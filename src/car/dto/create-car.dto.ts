// src/car/dto/create-car.dto.ts
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  
  name!: string;

  // PK ของรถ
  @IsString()
  id!: string;

  // FK ไป CarRentalCenter.id (crc_id)
  @IsString()
  crcId!: string;

  // ====== ฟิลด์ตามสคีมา ======
  @IsOptional() @IsString()
  type?: string;

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  seats?: number; // maps -> carseat (Int?)

  @IsOptional() @IsArray() @IsString({ each: true })
  pictures?: string[]; // default []

  // Decimal(10,2)
  @IsOptional() @Type(() => Number) @IsNumber()
  pricePerDay?: number;

  @IsOptional() @Type(() => Number) @IsNumber()
  pricePerHour?: number;

  @IsOptional() @IsString()
  brand?: string;

  @IsOptional() @IsString()
  currency?: string; // default "THB"

  @IsOptional() @Type(() => Number) @IsNumber()
  deposit?: number; // Decimal(10,2)

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  doors?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  features?: string[]; // default []

  @IsOptional() @IsString()
  fuelType?: string;

  @IsOptional() @IsString()
  fuelPolicy?: string; // maps -> fuel_policy

  @IsOptional() @IsString()
  pickupLocation?: string; // maps -> pickup_location

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  luggage?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  mileageLimitKm?: number; // maps -> mileage_limit_km

  @IsOptional() @IsString()
  transmission?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  year?: number;

  @IsOptional() @IsObject()
  availability?: Record<string, any>;

  @IsOptional() @IsObject()
  insurance?: Record<string, any>;
}
