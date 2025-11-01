import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from './create-user.dto';
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
    
      @ApiPropertyOptional()
      @IsOptional()
      @IsDate()
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

