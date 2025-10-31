import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateGroupUserPaymentDto {


  @ApiProperty({ example: 'SCB', description: 'Bank name', required: false })
  @IsString()
  @IsOptional()
  bank?: string;

  @ApiProperty({ example: '1234567890', description: 'Account number', required: false })
  @IsString()
  @IsOptional()
  accountNo?: string;

  @ApiProperty({ example: '0812345678', description: 'PromptPay ID', required: false })
  @IsString()
  @IsOptional()
  promtpayId?: string;
}
