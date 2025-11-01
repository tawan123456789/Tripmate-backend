import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomOptionDto {
  @IsString()
  name!: string;               // ex. "With breakfast"

  @IsOptional()
  @IsString()
  bed?: string;                // ex. "King size"

  @IsOptional()
  @IsInt()
  @Min(0)
  maxGuest?: number;           // map -> RoomOption.maxGuest

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  price: number;              // map -> Decimal(10,2)
}
