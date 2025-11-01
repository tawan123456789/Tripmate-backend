import {
  IsArray,
  IsOptional,
  IsString,
  IsNumber,
  Min,
  Max,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCarRentalCenterDto {
  // = UserService.id (FK) และเป็น PK ของ CarRentalCenter

  id!: string;

  @IsString()
  name!: string;

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  image?: string;

  // String[]
  @IsOptional() @IsArray() @IsString({ each: true })
  pictures?: string[];

  // Decimal(3,1) in DB — รับจาก client เป็น number (แนะนำ 0..5)
  @IsOptional() @Type(() => Number) @IsNumber() @Min(0) @Max(5)
  rating?: number;

  // Json fields (คาดหวังเป็น object)
  @IsOptional() @IsObject()
  branches?: Record<string, any>;

  @IsOptional() @IsObject()
  contacts?: Record<string, any>;

  @IsOptional() @IsObject()
  facilities?: Record<string, any>;

  @IsOptional() @IsObject()
  openingHours?: Record<string, any>;

  @IsOptional() @IsObject()
  anotherServices?: Record<string, any>;

  @IsOptional() @IsObject()
  subtopicRatings?: Record<string, any>;

  @IsOptional() @IsArray() @IsString({ each: true })
  paymentMethods?: string[];

  @IsOptional() @IsArray() @IsString({ each: true })
  requiredDocs?: string[];

  // misc
  @IsOptional() @IsString()
  type?: string;
}
