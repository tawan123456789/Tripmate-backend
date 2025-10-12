import { Transform } from 'class-transformer';
import { IsBooleanString, IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export type SortOrder = 'asc' | 'desc';

export class SearchQueryDto {
  @IsOptional() @IsString()
  q?: string;

  @IsOptional() @IsNumberString()
  page?: string; // default 1

  @IsOptional() @IsNumberString()
  pageSize?: string; // default 20

  @IsOptional() @IsString()
  @IsIn(['price', 'rating', 'distance', 'name', 'createdAt'])
  sortBy?: 'price' | 'rating' | 'distance' | 'name' | 'createdAt';

  @IsOptional() @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: SortOrder;

  // range filters
  @IsOptional() @IsNumberString()
  priceMin?: string;

  @IsOptional() @IsNumberString()
  priceMax?: string;

  @IsOptional() @IsNumberString()
  ratingMin?: string;

  // amenities=wifi,parking,pool
  @IsOptional() @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((s:string)=>s.trim()).filter(Boolean) : []))
  amenities?: string[] | string;

  // geofilter
  @IsOptional() @IsString()
  lat?: string;
  @IsOptional() @IsString()
  lng?: string;
  @IsOptional() @IsNumberString()
  radiusKm?: string;

  // availability window
  @IsOptional() @IsString()
  startDate?: string;

  @IsOptional() @IsString()
  endDate?: string;

  // open now (ถ้ามีฟิลด์เวลาเปิด-ปิด)
  @IsOptional() @IsBooleanString()
  openNow?: string;
}