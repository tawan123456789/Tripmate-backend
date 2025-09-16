import { Test, TestingModule } from '@nestjs/testing';
import { CarRentalCenterController } from './car_rental_center.controller';
import { CarRentalCenterService } from './car_rental_center.service';

describe('CarRentalCenterController', () => {
  let controller: CarRentalCenterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarRentalCenterController],
      providers: [CarRentalCenterService],
    }).compile();

    controller = module.get<CarRentalCenterController>(CarRentalCenterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
