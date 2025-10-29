import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
  IsObject,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/** โครง facilities (จะเก็บลง Prisma.Json) */
export class HotelFacilitiesDto {
  @IsOptional() @IsArray() @IsString({ each: true }) health?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) internet?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) food?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) accessibility?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) service?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) transportation?: string[];
}

/** โครง subtopicRatings (0–10) */
export class SubtopicRatingsDto {
  @IsOptional() @IsNumber() @Min(0) @Max(10) cleanliness?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) comfort?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) meal?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) location?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) service?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(10) facilities?: number;
}

/** helper: แปลงค่าให้เป็น string[] (รับได้ทั้ง string เดี่ยวหรือ array) */
const toStringArray = (v: any) => {
  if (v == null || v === '') return undefined;
  if (Array.isArray(v)) return v.map(String);
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
};

export class CreateHotelDto {
  serviceId!: string; // id ของ service (userService) ที่สร้างโรงแรมนี้ขึ้นมา
  @IsString()
  name!: string;

  @IsOptional() @IsString()
  type?: string; // "hotel" | "resort" | ...

  @IsOptional() @IsInt() @Min(1) @Max(5)
  star?: number;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  image?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  pictures?: string[]; // Prisma default = []

  @IsOptional() @IsString()
  facility?: string; // legacy ;wifi;pool;

  @IsOptional() @IsObject() @ValidateNested() @Type(() => HotelFacilitiesDto)
  facilities?: HotelFacilitiesDto; // Json

  @IsOptional() @IsNumber() @Min(0) @Max(10)
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  rating?: number; // map → Decimal(3,1)

  // policy fields
  @IsOptional() @IsString()
  checkIn?: string;

  @IsOptional() @IsString()
  checkOut?: string;

  @IsOptional() @IsString()
  breakfast?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value
  )
  petAllow?: boolean;

  @IsOptional() @IsString()
  contact?: string;

  @IsOptional() @IsObject() @ValidateNested() @Type(() => SubtopicRatingsDto)
  subtopicRatings?: SubtopicRatingsDto; // Json

  @IsOptional() @IsString()
  locationSummary?: string;

  @IsOptional() @IsArray() @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  nearbyLocations?: string[]; // Prisma default = []

  // หมายเหตุ: field relation (service) ไม่รวมใน DTO นี้
}
