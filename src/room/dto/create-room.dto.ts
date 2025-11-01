import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRoomOptionDto } from './room-option.dto';

export class CreateRoomDto {
  @IsString()
  id!: string;                // composite PK part 1

  @IsString()
  hotelId!: string;           // composite PK part 2

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pictures?: string[];        // default []

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];      // default []

  @IsOptional()
  @IsInt()
  @Min(0)
  sizeSqm?: number;

  // ✅ room options (สร้างเป็น array ของ object)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRoomOptionDto)
  options?: CreateRoomOptionDto[];
}