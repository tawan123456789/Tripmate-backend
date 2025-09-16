import { Module } from '@nestjs/common';
import { CarRentalCenterService } from './car_rental_center.service';
import { CarRentalCenterController } from './car_rental_center.controller';

@Module({
  controllers: [CarRentalCenterController],
  providers: [CarRentalCenterService],
})
export class CarRentalCenterModule {}
