import { Module } from '@nestjs/common';
import { CarRentalCenterService } from './car_rental_center.service';
import { CarRentalCenterController } from './car_rental_center.controller';
import { MinioModule } from 'src/minio/minio.module';
@Module({
  controllers: [CarRentalCenterController],
  providers: [CarRentalCenterService],
  exports: [CarRentalCenterService],
  imports: [MinioModule],
})
export class CarRentalCenterModule {}
