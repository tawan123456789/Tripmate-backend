import { IsEmail, IsOptional, IsString, IsDateString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString() fname: string;
  @IsString() lname: string;
  @IsString() username: string;

  @IsOptional() @IsDateString() birthDate?: string; // ส่งเป็น ISO string

  @IsOptional() @IsString() role?: string;

  @IsEmail() email: string;

  @IsString() @MinLength(6) password: string;

  @IsOptional() @IsString() profileImg?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() gender?: string;
}


export class ProfileUserDto {
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