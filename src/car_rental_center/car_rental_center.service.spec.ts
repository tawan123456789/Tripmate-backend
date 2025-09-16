import { Test, TestingModule } from '@nestjs/testing';
import { CarRentalCenterService } from './car_rental_center.service';

describe('CarRentalCenterService', () => {
  let service: CarRentalCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CarRentalCenterService],
    }).compile();

    service = module.get<CarRentalCenterService>(CarRentalCenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
