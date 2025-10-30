import { Module } from '@nestjs/common';
import { UserServicesService } from './user-services.service';
import { UserServicesController } from './user-services.controller';
import { GuideModule } from 'src/guide/guide.module';
import { CarRentalCenterModule } from 'src/car_rental_center/car_rental_center.module';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { HotelModule } from 'src/hotel/hotel.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    HotelModule,
    RestaurantModule,
    CarRentalCenterModule,
    GuideModule,
  ],
  controllers: [UserServicesController],
  providers: [UserServicesService],
  exports: [UserServicesService],
})
export class UserServicesModule {}
