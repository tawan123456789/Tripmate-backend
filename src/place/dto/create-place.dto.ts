import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  IsLongitude,
  IsLatitude,
  ValidateNested,
} from 'class-validator';

export class CreatePlaceDto {
  /** 🆔 รหัสสถานที่ (ไม่จำเป็นต้องส่ง — สร้างอัตโนมัติ) */
  @IsOptional()
  @IsUUID()
  id?: string;


  /** 🏠 ชื่อสถานที่ */
  @IsString()
  name!: string;

  /** 🏷️ ประเภทของสถานที่ เช่น "temple", "museum", "market" */
  @IsOptional()
  @IsString()
  type?: string;

  /** 📝 คำอธิบายเพิ่มเติม */
  @IsOptional()
  @IsString()
  description?: string;

  /** 🖼️ รูปภาพสถานที่ (URL หรือ Path) */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  placeImg?: string[];

  /** 🗺️ โซน เช่น "north", "south", "east", "west" */
  @IsOptional()
  @IsString()
  zone?: string;

  /** 🕒 วันที่สร้าง (ระบบจะ gen อัตโนมัติ) */
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  /** 🕒 วันที่อัปเดตล่าสุด (ระบบจะ gen อัตโนมัติ) */
  @IsOptional()
  @IsDateString()
  updatedAt?: string;

  /** 🕒 วันที่ลบ (soft delete) */
  @IsOptional()
  @IsDateString()
  deletedAt?: string;

  /** 🎡 เป็นสถานที่ท่องเที่ยวหรือไม่ */
  @IsOptional()
  @IsBoolean()
  isAttraction?: boolean;

  /** 🚦 สถานะ เช่น "active", "inactive" */
  @IsOptional()
  @IsString()
  status?: string;

    @IsLatitude() lat: string;
    @IsLongitude() long: string;
}
