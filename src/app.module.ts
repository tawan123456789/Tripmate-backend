// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LocationsModule } from './locations/location.module';
import { UserServicesModule } from './user-services/user-services.module';
import { HotelModule } from './hotel/hotel.module';
import { GuideModule } from './guide/guide.module';
import { RoomModule } from './room/room.module';
import { CarRentalCenterModule } from './car_rental_center/car_rental_center.module';
import { CarModule } from './car/car.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { TableModule } from './table/table.module';
import { ReviewModule } from './review/review.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { DiscountModule } from './discount/discount.module';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
      cache: true,
      expandVariables: true, 
    }),
    PrismaModule, 
    UsersModule,
    LocationsModule,
    UserServicesModule,
    HotelModule,
    GuideModule,
    RoomModule,
    CarRentalCenterModule,
    CarModule,
    RestaurantModule,
    TableModule,
    ReviewModule,
    BookmarkModule,
    DiscountModule,
    AuthModule,
    GroupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
