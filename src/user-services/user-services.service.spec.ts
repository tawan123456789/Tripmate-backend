import { Test, TestingModule } from '@nestjs/testing';
import { UserServicesService } from './user-services.service';

describe('UserServicesService', () => {
  let service: UserServicesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserServicesService],
    }).compile();

    service = module.get<UserServicesService>(UserServicesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
