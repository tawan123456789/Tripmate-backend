import { Module } from '@nestjs/common';
import { PlanUnitService } from './plan_unit.service';
import { PlanUnitController } from './plan_unit.controller';

@Module({
  controllers: [PlanUnitController],
  providers: [PlanUnitService],
})
export class PlanUnitModule {}
