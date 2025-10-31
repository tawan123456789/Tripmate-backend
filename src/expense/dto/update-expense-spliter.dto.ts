import { PartialType } from '@nestjs/swagger';
import { CreateExpenseSpliterDto } from './create-expense-spliter.dto';

export class UpdateExpenseSpliterDto extends PartialType(CreateExpenseSpliterDto) {}
