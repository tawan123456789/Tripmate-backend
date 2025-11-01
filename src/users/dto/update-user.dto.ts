import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from './create-user.dto';
import { Transform } from 'class-transformer';
import { IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateUserDto {
    @ApiPropertyOptional()
    @IsOptional()
    fname?: string;

    @ApiPropertyOptional()
    @IsOptional()
    lname?: string;

    @ApiPropertyOptional()
    @IsOptional()
    username?: string;

    @ApiPropertyOptional({ type: String, example: '2001-09-09' })
    @IsOptional()
    // ตัดค่าที่เป็น "" หรือ "null" หรือ null ออก เพื่อให้ IsOptional ทำงาน
    @Transform(({ value }) =>
        value === '' || value === null || value === 'null' ? undefined : value
    )
    @IsDateString() // รับ 'YYYY-MM-DD' หรือ ISO8601
    birthDate?: string;


    @ApiPropertyOptional({ enum: Role })
    @IsEnum(Role)
    @IsOptional()
    role?: Role;

    @ApiPropertyOptional()
    @IsOptional()
    gender?: string;

    @ApiPropertyOptional()
    @IsOptional()

    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional()
    @IsOptional()
    status?: string;


}

