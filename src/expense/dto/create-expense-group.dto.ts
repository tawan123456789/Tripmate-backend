
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateExpenseSpliterDto } from './create-expense-spliter.dto';

export class CreateExpenseGroupDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  groupId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional({
    type: [CreateExpenseSpliterDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExpenseSpliterDto)
  spliters?: CreateExpenseSpliterDto[];
}
