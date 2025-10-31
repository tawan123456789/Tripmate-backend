import { IsOptional, IsString } from 'class-validator';

export class CreatePlaceDto {
  @IsOptional()
  @IsString()
  id?: string; // ปล่อยให้ DB gen เอง หรือระบุถ้ามีระบบกำหนดเอง

  @IsOptional()
  @IsString()
  locationId?: string; // อ้างอิง Location.location_id

  @IsString()
  name!: string; // ชื่อสถานที่ (บังคับ)

  @IsOptional()
  @IsString()
  description?: string; // รายละเอียดของสถานที่

  @IsOptional()
  @IsString()
  placeImg?: string; // URL รูปภาพสถานที่
}
