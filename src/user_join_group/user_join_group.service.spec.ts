import { Test, TestingModule } from '@nestjs/testing';
import { UserJoinGroupService } from './user_join_group.service';

describe('UserJoinGroupService', () => {
  let service: UserJoinGroupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserJoinGroupService],
    }).compile();

    service = module.get<UserJoinGroupService>(UserJoinGroupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
