import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './create-car.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, IsArray, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateCarDto extends PartialType(CreateCarDto) {
  @ApiPropertyOptional() @IsOptional() @IsString()
  name?: string;

  // ปกติไม่ให้แก้ PK ผ่าน update ถ้าต้องการจริง ๆ ค่อยเปิดทีหลัง
  @ApiPropertyOptional() @IsOptional() @IsString()
  id?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  crcId?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  type?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  model?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  description?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  seats?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  pictures?: string[];

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  pricePerDay?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  pricePerHour?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  brand?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  currency?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsNumber()
  deposit?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  doors?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional() @IsArray() @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional() @IsOptional() @IsString()
  fuelType?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  fuelPolicy?: string;

  @ApiPropertyOptional() @IsOptional() @IsString()
  pickupLocation?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  luggage?: number;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() @Min(0)
  mileageLimitKm?: number;

  @ApiPropertyOptional() @IsOptional() @IsString()
  transmission?: string;

  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt()
  year?: number;

  @ApiPropertyOptional({ type: Object })
  @IsOptional() @IsObject()
  availability?: Record<string, any>;

  @ApiPropertyOptional({ type: Object })
  @IsOptional() @IsObject()
  insurance?: Record<string, any>;
}
