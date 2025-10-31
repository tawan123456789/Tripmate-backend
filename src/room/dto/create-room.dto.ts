import { IsArray, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

const toStringArray = (v: any) => {
  if (v == null || v === '') return undefined;
  if (Array.isArray(v)) return v.map(String);
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
};

export class CreateRoomDto {
  @IsOptional() @IsString()
  name?: string;

  @IsOptional() @IsString()
  id: string; // ✅ เพิ่ม ฟิลด์ id (optional ถ้าจะให้ service gen)
  @IsString()
  hotelId!: string; // ต้องระบุว่าเป็นของโรงแรมไหน

  @IsOptional() @IsArray() @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  pictures?: string[]; // Prisma default = []

  @IsOptional() @IsString()
  description?: string;

  @IsOptional() @IsString()
  image?: string; // legacy

  @IsOptional() @IsString()
  bedType?: string;

  @IsOptional() @IsInt() @Min(1)
  personPerRoom?: number;

  @IsOptional() @IsInt() @Min(0)
  sizeSqm?: number;

  @IsOptional() @IsArray() @IsString({ each: true })
  @Transform(({ value }) => toStringArray(value))
  facilities?: string[]; // Prisma default = []

  @IsOptional() @IsNumber() @Min(0)
  @Transform(({ value }) => (value === '' || value == null ? undefined : Number(value)))
  pricePerNight?: number; // map → Decimal(10,2)
}
