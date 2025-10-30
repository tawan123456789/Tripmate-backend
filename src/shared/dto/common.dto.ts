import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDecimal,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  Min,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';

/** ค่าเงิน ให้ส่งเป็น string เช่น "1999.00" เพื่อเข้ากับ Prisma Decimal */
export class MoneyStringDto {
  @IsOptional()
  @IsDecimal({ decimal_digits: '1,2' })
  value?: string; // เช่น "1500.00"
}

/** ช่วงเวลาเปิด-ปิดรายวัน */
export class OpeningHourDto {
  @IsString()
  day!: string; // "Mon" | "Tue" | ... หรือ "จันทร์" ตามดีไซน์

  @IsString()
  @Length(4, 5)
  open!: string; // "09:00"

  @IsString()
  @Length(4, 5)
  close!: string; // "18:00"
}

/** ช่องทางติดต่อทั่วไป */
export class ContactsDto {
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsEmail()  email?: string;
  @IsOptional() @IsUrl()    website?: string;
  @IsOptional() @IsString() line?: string;
  @IsOptional() @IsUrl()    facebook?: string;
  @IsOptional() @IsUrl()    instagram?: string;
}

/** โครง facilities แบบ object แยกหมวด */
export class FacilitiesDto {
  @IsOptional() @IsArray() @IsString({ each: true }) general?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) food?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) services?: string[];
  // ขยายหมวดเพิ่มได้
}

/** rating รายหมวด (ยืดหยุ่น—คีย์ใด ๆ ค่าตัวเลข) */
export class SubtopicRatingsDto {
  [key: string]: number | undefined;
}

/** นโยบายการจอง (Restaurant) */
export class ReservationPolicyDto {
  @IsOptional() @IsBoolean() required?: boolean;
  @IsOptional() @ValidateNested() @Type(() => MoneyStringDto) deposit?: MoneyStringDto;
  @IsOptional() @IsArray() @IsString({ each: true }) channels?: string[];
}

/** สาขา (CarRentalCenter) */
export class BranchDto {
  @IsString() name!: string;
  @IsString() address!: string;
  @IsOptional() @IsObject() geo?: { lat: number; lng: number };
}

/** Pick-up/Drop-off options (CarRentalCenter) */
export class PickupDropoffDto {
  @IsOptional() @IsBoolean() airport?: boolean;
  @IsOptional() @IsBoolean() hotel?: boolean;
  @IsOptional() @IsBoolean() shuttle?: boolean;
  @IsOptional() @IsObject()  fees?: Record<string, number>;
}

/** Policies (CarRentalCenter) */
export class CrcPoliciesDto {
  @IsOptional() @IsString() fuelPolicy?: string; // "full_to_full" ฯลฯ
  @IsOptional() @IsObject() mileagePolicy?: { limitPerDayKm?: number; overFeePerKm?: number };
  @IsOptional() @IsObject() agePolicy?: { minAge?: number; youngDriverFee?: number };
  @IsOptional() @ValidateNested() @Type(() => MoneyStringDto) deposit?: MoneyStringDto;
  @IsOptional() @IsObject() insurance?: { basicIncluded?: boolean; excess?: number; fullCoverPerDay?: number };
  @IsOptional() @IsObject() cancellation?: { freeBeforeHours?: number; lateFeePercent?: number };
}

/** ไฟล์รูปเป็น Array<string> */
export class PicturesArrayDto {
  @IsArray() @IsString({ each: true }) pictures!: string[];
}

/** Nearby รวมข้อความ (เช่น "Place A - 200 m") */
export class NearbyArrayDto {
  @IsArray() @IsString({ each: true }) nearbyLocations!: string[];
}
