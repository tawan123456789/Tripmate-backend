import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDecimal, IsInt, IsOptional, IsString, ValidateNested,
} from 'class-validator';
import {
  ContactsDto,
  SubtopicRatingsDto,
} from '../../shared/dto/common.dto';

export class CreateGuideDto {
  id!: string;
  @IsString() name!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) pictures?: string[];

  // rating Decimal(3,1)
  @IsOptional() @IsDecimal({ decimal_digits: '1' }) rating?: string;
  @IsOptional() subtopicRatings?: SubtopicRatingsDto;

  @IsOptional() @IsArray() @IsString({ each: true }) languages?: string[];
  @IsOptional() @IsString() licenseId?: string;
  @IsOptional() @IsBoolean() verified?: boolean;
  @IsOptional() @IsInt() experienceYears?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) specialties?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) regionsCovered?: string[];

  // ราคา (เดิมมี pay) + rate อื่น ๆ — Decimal(10,2) เป็น string
  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) pay?: string;
  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) hourlyRate?: string;
  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) dayRate?: string;
  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) overtimeRate?: string;
  @IsOptional() @IsString() currency?: string;

  @IsOptional() @IsString() contact?: string;
  @IsOptional() @ValidateNested() @Type(() => ContactsDto) contacts?: ContactsDto;

  /** availability/policies: ใช้ JSON ยืดหยุ่น — หากต้อง strict ค่อยแตก DTO */
  @IsOptional() availability?: Record<string, any>;
  @IsOptional() policies?: Record<string, any>;

  @IsOptional() @IsString() locationSummary?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) nearbyLocations?: string[];
}
