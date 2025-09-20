import { MiddlewareConsumer, Module } from '@nestjs/common';
import { CarService } from './car.service';
import { CarController } from './car.controller';
import { AuthMiddleware } from '../auth/middleware/auth.middleware';
@Module({
  controllers: [CarController],
  providers: [CarService],
})
export class CarModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes('car'); // ใส่ชื่อ path หรือ controller ที่ต้องการ protect
  }

}
