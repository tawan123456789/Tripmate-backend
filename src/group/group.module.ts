import { Module } from '@nestjs/common';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { MinioModule } from '../minio/minio.module';
@Module({
  imports: [MinioModule],
  controllers: [GroupController],
  providers: [GroupService],
})
export class GroupModule {}
