import { IsNumber, Min, Max, IsOptional } from 'class-validator';

export class NearbyLocationDto {
  @IsNumber() @Min(-90)  @Max(90)
  lat!: number;

  @IsNumber() @Min(-180) @Max(180)
  lng!: number;

  /** รัศมีหน่วยเป็นกิโลเมตร (ค่าเริ่มต้น 5 km) */
  @IsOptional() @IsNumber() @Min(0.1)
  radiusKm?: number = 5;

  /** จำนวนผลลัพธ์ที่ต้องการ */
  @IsOptional() @IsNumber() @Min(1) @Max(200)
  limit?: number = 50;
}