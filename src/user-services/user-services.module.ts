import { Module } from '@nestjs/common';
import { UserServicesService } from './user-services.service';
import { UserServicesController } from './user-services.controller';

@Module({
  controllers: [UserServicesController],
  providers: [UserServicesService],
})
export class UserServicesModule {}
