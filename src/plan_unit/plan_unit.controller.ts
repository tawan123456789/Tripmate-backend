import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PlanUnitService } from './plan_unit.service';
import { CreatePlanUnitDto } from './dto/create-plan_unit.dto';
import { UpdatePlanUnitDto } from './dto/update-plan_unit.dto';

@Controller('plan-unit')
export class PlanUnitController {
  constructor(private readonly planUnitService: PlanUnitService) {}

  @Post()
  create(@Body() createPlanUnitDto: CreatePlanUnitDto) {
    return this.planUnitService.create(createPlanUnitDto);
  }

  @Get()
  findAll() {
    return this.planUnitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planUnitService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanUnitDto: UpdatePlanUnitDto) {
    return this.planUnitService.update(id, updatePlanUnitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planUnitService.remove(id);
  }
}
