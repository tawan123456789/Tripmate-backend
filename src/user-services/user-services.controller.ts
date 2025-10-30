import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserServicesService } from './user-services.service';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';
import { CreateHotelDto } from 'src/hotel/dto/create-hotel.dto';

@Controller('user-services')
export class UserServicesController {
  constructor(private readonly userServicesService: UserServicesService) {}

  @Post('hotel')
  createHotelService(@Body() createUserServiceDto: CreateUserServiceDto, @Body() createHotelDto: CreateHotelDto) {
    return this.userServicesService.createHotelService(createUserServiceDto, createHotelDto);
  }

  @Get()
  findAll() {
    return this.userServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userServicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserServiceDto: UpdateUserServiceDto) {
    return this.userServicesService.update(id, updateUserServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userServicesService.remove(id);
  }
}
