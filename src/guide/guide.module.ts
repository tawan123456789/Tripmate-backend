import { Module } from '@nestjs/common';
import { GuideService } from './guide.service';
import { GuideController } from './guide.controller';
import { MinioModule } from 'src/minio/minio.module';
@Module({
  controllers: [GuideController],
  providers: [GuideService],
  exports: [GuideService],
  imports: [MinioModule],
})
export class GuideModule {}
