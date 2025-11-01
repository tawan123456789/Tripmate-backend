// src/place/dto/create-place.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePlaceDto {
  /** 🆔 รหัสสถานที่ (ใช้ place_id ใน DB) */
  @IsString()
  id!: string;

  /** 📍 รหัส location (อ้างอิง Location.location_id) */
  @IsOptional()
  @IsString()
  locationId?: string;

  /** 🏷️ ชื่อสถานที่ */
  @IsString()
  name!: string;

  /** 📝 รายละเอียดเพิ่มเติม */
  @IsOptional()
  @IsString()
  description?: string;


  /** 🔖 สถานะ (active/inactive ฯลฯ) */
  @IsOptional()
  @IsString()
  status?: string;

  /** 🕒 วันสร้าง (optional เพราะ DB มี default = now()) */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  createdAt?: Date;

  /** 🕓 วันอัปเดตล่าสุด (optional เพราะมี @updatedAt) */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  updatedAt?: Date;

  /** 🗑️ วันลบ (soft delete) */
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deletedAt?: Date;

  /** 🏞️ ระบุว่าเป็นสถานที่ท่องเที่ยวหรือไม่ */
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAttraction?: boolean;
}
