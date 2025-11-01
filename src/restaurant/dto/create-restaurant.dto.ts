import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDecimal, IsInt, IsOptional, IsString, Max, Min, ValidateNested, IsUrl,
} from 'class-validator';
import {
  ContactsDto,   
  FacilitiesDto,
  OpeningHourDto,
  ReservationPolicyDto,
  SubtopicRatingsDto,
} from '../../shared/dto/common.dto';

export class CreateRestaurantDto {
  id!: string; // ต้องตรงกับ service.id ด้วยในชั้นใช้งาน

  @IsString()
  name!: string;

  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() cuisine?: string;
  @IsOptional() @IsInt()    @Min(1) @Max(5) priceLevel?: number;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() menu?: string;   // URL หรือข้อความ
  @IsOptional() @IsString() image?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) pictures?: string[];
  @IsOptional() @IsString() facility?: string;

  @IsOptional() @ValidateNested() @Type(() => FacilitiesDto) facilities?: FacilitiesDto;

  // Prisma Decimal(3,1) — ส่งเป็น string "8.7" หรือ number ก็ได้ (นี่เลือก string)
  @IsOptional() @IsDecimal({ decimal_digits: '1' })
  rating?: string;

  @IsOptional() subtopicRatings?: SubtopicRatingsDto;

  @IsOptional() @IsString() locationSummary?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) nearbyLocations?: string[];

  @IsOptional() @IsString() contact?: string;
  @IsOptional() @ValidateNested() @Type(() => ContactsDto) contacts?: ContactsDto;

  @IsOptional() @ValidateNested({ each: true }) @Type(() => OpeningHourDto)
  openingHours?: OpeningHourDto[];

  @IsOptional() @ValidateNested() @Type(() => ReservationPolicyDto)
  reservationPolicy?: ReservationPolicyDto;

  @IsOptional() @IsBoolean() petAllow?: boolean;

  @IsOptional() @IsArray() @IsString({ each: true }) dietaryTags?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) services?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) paymentMethods?: string[];
}
