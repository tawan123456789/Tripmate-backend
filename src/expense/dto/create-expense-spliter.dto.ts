import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsEnum } from 'class-validator';

export class CreateExpenseSpliterDto {

  @ApiProperty({ description: 'User id participating in the split', example: 'f87b7d14-00fe-44a8-9e6d-7d87a1877faa' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional({ description: 'Status of the splitter (e.g., PENDING, PAID)', example: 'PENDING' })
  @IsOptional()
  @IsString()
  status?: string;
}
