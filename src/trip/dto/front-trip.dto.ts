import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class FrontLocationDto {
  @ApiPropertyOptional() @IsOptional() @IsString() label?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lat?: number;
  @ApiPropertyOptional() @IsOptional() @IsNumber() lng?: number;
}

export class FrontTripEventDto {
  @ApiProperty() @IsString() title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() desc?: string;
  @ApiProperty({ description: 'รูปแบบ HH.mm เช่น 06.00' }) @IsString() time: string;
  @ApiPropertyOptional({ type: FrontLocationDto }) @IsOptional() @Type(() => FrontLocationDto) location?: FrontLocationDto;
}

export class FrontTripServiceDto {
  @ApiProperty() @IsString() id: string; // ต้องเป็น userService.id จริง
  @ApiProperty({ enum: ['hotel', 'guide', 'car'] }) @IsString() type: 'hotel' | 'guide' | 'car';
  @ApiPropertyOptional() @IsOptional() @IsString() roomId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() packageId?: string;
  @ApiPropertyOptional() @IsOptional() @IsNumber() quantity?: number;
}

export class FrontTripDayDto {
  @ApiProperty({ description: 'เริ่มนับจาก 0' }) @IsNumber() day: number;
  @ApiPropertyOptional() @IsOptional() @IsString() dayLabel?: string;
  @ApiProperty() @IsNumber() dateOffset: number;
  @ApiProperty({ type: [FrontTripEventDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => FrontTripEventDto) events: FrontTripEventDto[];
  @ApiProperty({ type: [FrontTripServiceDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => FrontTripServiceDto) services: FrontTripServiceDto[];
}

export class FrontCreateTripPayloadDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsBoolean() isPublic: boolean;

  @ApiProperty() @IsISO8601() startDate: string;
  @ApiPropertyOptional() @IsOptional() @IsISO8601() endDate?: string;

  @ApiPropertyOptional() @IsOptional() @IsNumber() peopleCount?: number; // (ยังไม่ได้เก็บใน TripPlan)
  @ApiPropertyOptional() @IsOptional() @IsNumber() roomCount?: number;   // (ยังไม่ได้เก็บใน TripPlan)

  @ApiProperty({ type: [FrontTripDayDto] }) @IsArray() @ValidateNested({ each: true }) @Type(() => FrontTripDayDto) days: FrontTripDayDto[];

  @ApiPropertyOptional() @IsOptional() @IsUUID() ownerId?: string; // จะดึงจาก req.user.id ถ้าไม่ส่งมา
}
