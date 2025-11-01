import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsEnum, IsOptional } from 'class-validator';
import { Role } from '../../users/dto/create-user.dto';

export class RegisterDto {
  @ApiProperty()
  username: string;

  @ApiProperty()
  password: string;

  @ApiPropertyOptional()
  email?: string;
}

export class RegisterWithFileDto {
  @ApiProperty()
  fname: string;

  @ApiProperty()
  lname: string;

  @ApiProperty()
  username: string;

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

  @ApiProperty()
  password: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  status?: string;

  @ApiProperty({ type: 'string', format: 'binary', required: false })
  profileImg?: any;
}
