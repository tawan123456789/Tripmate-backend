import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { MinioModule } from 'src/minio/minio.module';

@Module({
  controllers: [RoomController],
  providers: [RoomService],
  imports: [MinioModule],
})
export class RoomModule {}
