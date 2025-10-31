import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarRentalCenterService } from './car_rental_center.service';
import { CreateCarRentalCenterDto } from './dto/create-car_rental_center.dto';
import { UpdateCarRentalCenterDto } from './dto/update-car_rental_center.dto';
import { CreateCarDto } from 'src/car/dto/create-car.dto';

@Controller('car-rental-center')
export class CarRentalCenterController {
  constructor(private readonly carRentalCenterService: CarRentalCenterService) {}

  @Post()
  create(@Body() createCarRentalCenterDto: CreateCarRentalCenterDto) {
    return this.carRentalCenterService.create(createCarRentalCenterDto);
  }

  @Get()
  findAll() {
    return this.carRentalCenterService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carRentalCenterService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarRentalCenterDto: UpdateCarRentalCenterDto) {
    return this.carRentalCenterService.update(id, updateCarRentalCenterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carRentalCenterService.remove(id);
  }

  @Post('add-car')
  addCar(@Body() CreateCarDto: CreateCarDto) {
    return this.carRentalCenterService.addCar(CreateCarDto);
  }
}
