import { Module } from '@nestjs/common';
import { PlaceService } from './place.service';
import { PlaceController } from './place.controller';
import { MinioModule } from 'src/minio/minio.module';
@Module({
  controllers: [PlaceController],
  providers: [PlaceService],
  imports: [MinioModule],
})
export class PlaceModule {}
