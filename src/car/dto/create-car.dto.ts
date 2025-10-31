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
  
  @IsString()
  id!: string;           // ต้องไม่ซ้ำภายในระบบรถ

  @IsString()
  crcId!: string;        // อ้างอิง CarRentalCenter.crc_id

  @IsOptional() @IsString()
  model?: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsInt() @Min(1)
  seats?: number;

  @IsOptional() @IsString()
  image?: string;

  // Decimal ใน Prisma: รับเป็น number จาก client
  @IsOptional() @Type(() => Number) @IsNumber()
  pricePerDay?: number;     // Prisma Decimal(10,2)

  @IsOptional() @Type(() => Number) @IsNumber()
  pricePerHour?: number;    // Prisma Decimal(10,2)

  @IsOptional() @IsString()
  brand?: string;

  @IsOptional() @IsString()
  currency?: string;        // default "THB" ใน DB

  @IsOptional() @Type(() => Number) @IsNumber()
  deposit?: number;         // Prisma Decimal(10,2)

  @IsOptional() @IsInt() @Min(0)
  doors?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  features?: string[];

  @IsOptional() @IsString()
  fuelType?: string;

  @IsOptional() @IsInt() @Min(0)
  luggage?: number;

  @IsOptional() @IsInt() @Min(0)
  mileageLimitKm?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  pictures?: string[];

  @IsOptional() @IsString()
  transmission?: string;

  @IsOptional() @IsInt()
  year?: number;

  // JSON ฟิลด์: ให้ส่งเป็น object มาได้
  @IsOptional() @IsObject()
  availability?: Record<string, any>;

  @IsOptional() @IsObject()
  insurance?: Record<string, any>;
}
