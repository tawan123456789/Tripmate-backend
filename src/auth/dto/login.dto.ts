import { ApiProperty } from '@nestjs/swagger';
import { IsString, isString } from 'class-validator';

export class LoginDto {
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  password: string;
}
