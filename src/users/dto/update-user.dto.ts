import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from './create-user.dto';
export class UpdateUserDto {
      @ApiPropertyOptional()
      fname?: string;
    
      @ApiPropertyOptional()
      lname?: string;
    
      @ApiPropertyOptional()
      username?: string;
    
      @ApiPropertyOptional()
      @IsDate()
      birthDate?: Date;
    
      @ApiPropertyOptional({ enum: Role })
      @IsEnum(Role)
      role?: Role;
    
      @ApiPropertyOptional()
      gender?: string;
    
      @ApiPropertyOptional()
      @IsOptional()
      email?: string;
    
      @ApiPropertyOptional()
      phone?: string;
    
      @ApiPropertyOptional()
      status?: string;
    
      @ApiProperty({ type: 'string', format: 'binary', required: false })
      profileImg?: any;
}

