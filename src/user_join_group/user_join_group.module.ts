import { Module } from '@nestjs/common';
import { UserJoinGroupService } from './user_join_group.service';
import { UserJoinGroupController } from './user_join_group.controller';

@Module({
  controllers: [UserJoinGroupController],
  providers: [UserJoinGroupService],
})
export class UserJoinGroupModule {}
