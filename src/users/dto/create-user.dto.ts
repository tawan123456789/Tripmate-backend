import { IsEmail, IsOptional, IsString, IsDateString, MinLength, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum Role {
  ADMIN = 'admin',
  USER = 'user',
  HOTEL_MANAGER = 'hotel-manager',
  CAR_MANAGER = 'car-manager',
  RESTAURANT_MANAGER = 'restaurant-manager',
  GUIDE = 'guide',
}

export class CreateUserDto {
  @IsString() fname: string;
  @IsString() lname: string;
  @IsString() username: string;

  @IsOptional() @IsDateString() birthDate?: string; // ส่งเป็น ISO string

  @IsOptional() @IsEnum(Role) role?: Role;

  @IsEmail() email: string;

  @IsString() @MinLength(6) password: string;

  @IsOptional() @IsString() profileImg?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() gender?: string;
}


export class ProfileUserDto {
  @IsString() username: string;
  @IsString() fname: string;
  @IsString() lname: string;
  @IsDateString() birthDate?: string; // ส่งเป็น ISO string
  @IsString() phone?: string;
  @IsString() email: string;
  @IsString() gender?: string;
  @IsString() profileImg?: string;

}
export class ChangePasswordDto{
  @IsString()  oldPassword: string;
  @IsString()  newPassword: string;     
}