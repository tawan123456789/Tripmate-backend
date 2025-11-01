import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';
import { MinioModule } from 'src/minio/minio.module';
@Module({
  controllers: [CarController],
  providers: [CarService],
  imports: [MinioModule],
})
export class CarModule {

}
