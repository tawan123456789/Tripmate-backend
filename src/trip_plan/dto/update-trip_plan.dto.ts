import { PartialType } from '@nestjs/mapped-types';
import { CreateTripPlanDto } from './create-trip_plan.dto';

export class UpdateTripPlanDto extends PartialType(CreateTripPlanDto) {}
