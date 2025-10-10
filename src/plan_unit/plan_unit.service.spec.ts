import { Test, TestingModule } from '@nestjs/testing';
import { PlanUnitService } from './plan_unit.service';

describe('PlanUnitService', () => {
  let service: PlanUnitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanUnitService],
    }).compile();

    service = module.get<PlanUnitService>(PlanUnitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
