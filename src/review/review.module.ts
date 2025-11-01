import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService],
  imports: [MinioModule],
})
export class ReviewModule {}
