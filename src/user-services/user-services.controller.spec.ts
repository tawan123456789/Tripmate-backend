import { Test, TestingModule } from '@nestjs/testing';
import { UserServicesController } from './user-services.controller';
import { UserServicesService } from './user-services.service';

describe('UserServicesController', () => {
  let controller: UserServicesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserServicesController],
      providers: [UserServicesService],
    }).compile();

    controller = module.get<UserServicesController>(UserServicesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
