import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from './create-user.dto';
import { Transform } from 'class-transformer';
import { IsDateString } from 'class-validator';
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
    
        @ApiPropertyOptional({ example: '2001-09-09' })
        @IsOptional()
        @Transform(({ value }) => (value === '' || value === null ? undefined : value))
        @IsDateString() 
      birthDate?: Date;
    
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
      phone?: string;
    
      @ApiPropertyOptional()
      @IsOptional()
      status?: string;
    
      @ApiPropertyOptional({ type: 'string', format: 'binary', required: false })
      @IsOptional()
      profileImg?: any;
}

