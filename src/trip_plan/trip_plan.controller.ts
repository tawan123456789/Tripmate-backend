import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripPlanService } from './trip_plan.service';
import { CreateTripPlanDto } from './dto/create-trip_plan.dto';
import { UpdateTripPlanDto } from './dto/update-trip_plan.dto';

@Controller('trip-plan')
export class TripPlanController {
  constructor(private readonly tripPlanService: TripPlanService) {}

  @Post()
  create(@Body() createTripPlanDto: CreateTripPlanDto) {
    return this.tripPlanService.create(createTripPlanDto);
  }

  @Get()
  findAll() {
    return this.tripPlanService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripPlanService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripPlanDto: UpdateTripPlanDto) {
    return this.tripPlanService.update(id, updateTripPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripPlanService.remove(id);
  }



}
