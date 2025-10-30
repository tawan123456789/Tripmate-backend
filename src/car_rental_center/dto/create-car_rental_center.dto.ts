import { Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDecimal, IsOptional, IsString, ValidateNested,
} from 'class-validator';
import {
  BranchDto,
  ContactsDto,
  CrcPoliciesDto,
  FacilitiesDto,
  OpeningHourDto,
  PickupDropoffDto,
  SubtopicRatingsDto,
} from '../../shared/dto/common.dto';

export class CreateCarRentalCenterDto {
  @IsString() id!: string;
  @IsString() name!: string;

  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() image?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) pictures?: string[];
  @IsOptional() @IsString() facility?: string;
  @IsOptional() @ValidateNested() @Type(() => FacilitiesDto) facilities?: FacilitiesDto;

  // rating Decimal(3,1)
  @IsOptional() @IsDecimal({ decimal_digits: '1' }) rating?: string;
  @IsOptional() subtopicRatings?: SubtopicRatingsDto;

  @IsOptional() @IsString() locationSummary?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) nearbyLocations?: string[];

  @IsOptional() @IsString() contact?: string;
  @IsOptional() @ValidateNested() @Type(() => ContactsDto) contacts?: ContactsDto;

  @IsOptional() @ValidateNested({ each: true }) @Type(() => OpeningHourDto)
  openingHours?: OpeningHourDto[];

  @IsOptional() @ValidateNested() @Type(() => PickupDropoffDto)
  pickupDropoff?: PickupDropoffDto;

  @IsOptional() @ValidateNested({ each: true }) @Type(() => BranchDto)
  branches?: BranchDto[];

  @IsOptional() @ValidateNested() @Type(() => CrcPoliciesDto)
  policies?: CrcPoliciesDto;

  @IsOptional() @IsArray() @IsString({ each: true }) paymentMethods?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) requiredDocs?: string[];
}
