import { Module } from '@nestjs/common';
import { TripPlanService } from './trip_plan.service';
import { TripPlanController } from './trip_plan.controller';

@Module({
  controllers: [TripPlanController],
  providers: [TripPlanService],
})
export class TripPlanModule {}
