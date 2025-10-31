import { PartialType } from '@nestjs/swagger';
import { CreateExpenseGroupDto } from './create-expense-group.dto';

export class UpdateExpenseGroupDto extends PartialType(CreateExpenseGroupDto) {}
