import { IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserServiceDto {
  @IsString() id!: string;           // เช่น "svc-005"
  @IsUUID()  ownerId!: string;
  @IsOptional() @IsString() locationId?: string; // เช่น "loc-005"
  @IsString() name!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() serviceImg?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() type?: string;
}