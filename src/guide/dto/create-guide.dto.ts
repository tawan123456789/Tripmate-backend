// src/guide/dto/create-guide.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ContactsDto, SubtopicRatingsDto } from '../../shared/dto/common.dto';

export class CreateGuideDto {
  @ApiProperty({ description: 'รหัสไกด์ (ต้องตรงกับ userService.id เพราะใช้เป็น FK)', example: 'srv_123' })
  @IsString()
  id!: string;

  @ApiProperty({ description: 'ชื่อไกด์', example: 'Somchai Travel Expert' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'คำอธิบาย', example: 'Local guide specializing in northern culture.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'รูปภาพหลัก (URL)' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ description: 'รายการรูปภาพ (URL)', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];

  // Decimal(3,1)
  @ApiPropertyOptional({ description: 'คะแนนเฉลี่ย เช่น 4.5 (string)', example: '4.5' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '1' })
  rating?: string;

  @ApiPropertyOptional({ description: 'คะแนนย่อย (JSON)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => SubtopicRatingsDto)
  subtopicRatings?: SubtopicRatingsDto;

  @ApiPropertyOptional({ description: 'ภาษาที่รองรับ', type: [String], example: ['Thai', 'English'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'เลขใบอนุญาต' })
  @IsOptional()
  @IsString()
  licenseId?: string;

  @ApiPropertyOptional({ description: 'ยืนยันตัวตนแล้วหรือไม่', default: false })
  @IsOptional()
  @IsBoolean()
  verified?: boolean;

  @ApiPropertyOptional({ description: 'ประสบการณ์ (ปี)' })
  @IsOptional()
  @IsInt()
  experienceYears?: number;

  @ApiPropertyOptional({ description: 'ความเชี่ยวชาญ', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ description: 'ภูมิภาคที่ให้บริการ', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regionsCovered?: string[];

  // Decimal(10,2)
  @ApiPropertyOptional({ description: 'อัตราค่าจ้างรวม/ทั่วไป (string)', example: '3000.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  pay?: string;

  @ApiPropertyOptional({ description: 'อัตราค่าจ้างรายชั่วโมง (string)', example: '450.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  hourlyRate?: string;

  @ApiPropertyOptional({ description: 'อัตราค่าจ้างรายวัน (string)', example: '2500.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  dayRate?: string;

  @ApiPropertyOptional({ description: 'อัตราค่า OT ต่อชั่วโมง (string)', example: '600.00' })
  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  overtimeRate?: string;

  @ApiPropertyOptional({ description: 'สกุลเงิน (ค่าเริ่มต้น THB)', example: 'THB' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'ช่องทางติดต่อหลัก' })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ description: 'ข้อมูลการติดต่อแบบละเอียด (JSON)' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactsDto)
  contacts?: ContactsDto;

  @ApiPropertyOptional({ description: 'ความพร้อมให้บริการ (JSON)' })
  @IsOptional()
  availability?: Record<string, any>;

  @ApiPropertyOptional({ description: 'นโยบายการให้บริการ (JSON)' })
  @IsOptional()
  policies?: Record<string, any>;

  @ApiPropertyOptional({ description: 'สรุปพื้นที่ให้บริการ' })
  @IsOptional()
  @IsString()
  locationSummary?: string;

  @ApiPropertyOptional({ description: 'สถานที่ใกล้เคียงที่ให้บริการ', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearbyLocations?: string[];
}
