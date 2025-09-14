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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
