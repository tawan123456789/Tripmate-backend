import { Module } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { HotelController } from './hotel.controller';
import { Min } from 'class-validator';
import { MinioModule } from 'src/minio/minio.module';
@Module({
  controllers: [HotelController],
  providers: [HotelService],
  exports: [HotelService],
  imports: [MinioModule],
})
export class HotelModule {}
