import { PartialType } from '@nestjs/mapped-types';
import { CreatePlanUnitDto } from './create-plan_unit.dto';

export class UpdatePlanUnitDto extends PartialType(CreatePlanUnitDto) {}
