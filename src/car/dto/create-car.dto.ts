import { IsArray, IsDecimal, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCarDto {
  @IsString() id!: string;
  @IsString() crcId!: string;

  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsInt() year?: number;

  @IsOptional() @IsString() transmission?: string; // "AT"/"MT"
  @IsOptional() @IsInt() seats?: number;
  @IsOptional() @IsInt() doors?: number;
  @IsOptional() @IsInt() luggage?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) pictures?: string[];
  @IsOptional() @IsString() image?: string;

  @IsOptional() @IsString() fuelType?: string;

  @IsOptional() @IsInt() mileageLimitKm?: number;

  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) deposit?: string;
  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) pricePerDay?: string;
  @IsOptional() @IsDecimal({ decimal_digits: '1,2' }) pricePerHour?: string;

  @IsOptional() @IsString() currency?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
    @IsOptional() @IsString() description?: string;

  /** insurance / availability เป็น JSON อิสระ — ถ้าต้อง strict ค่อยแตก DTO ภายหลัง */
  @IsOptional() insurance?: Record<string, any>;
  @IsOptional() availability?: Record<string, any>;
}
