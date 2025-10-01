import { Test, TestingModule } from '@nestjs/testing';
import { UserJoinGroupController } from './user_join_group.controller';
import { UserJoinGroupService } from './user_join_group.service';

describe('UserJoinGroupController', () => {
  let controller: UserJoinGroupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserJoinGroupController],
      providers: [UserJoinGroupService],
    }).compile();

    controller = module.get<UserJoinGroupController>(UserJoinGroupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
