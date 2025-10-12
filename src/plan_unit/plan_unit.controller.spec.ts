import { Test, TestingModule } from '@nestjs/testing';
import { PlanUnitController } from './plan_unit.controller';
import { PlanUnitService } from './plan_unit.service';

describe('PlanUnitController', () => {
  let controller: PlanUnitController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanUnitController],
      providers: [PlanUnitService],
    }).compile();

    controller = module.get<PlanUnitController>(PlanUnitController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
