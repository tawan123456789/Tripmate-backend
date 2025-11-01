import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserServicesService } from './user-services.service';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';
import { CreateHotelDto } from 'src/hotel/dto/create-hotel.dto';
import { CreateRestaurantDto } from 'src/restaurant/dto/create-restaurant.dto';
import { CreateCarRentalCenterDto } from 'src/car_rental_center/dto/create-car_rental_center.dto';
import { CreateGuideDto } from 'src/guide/dto/create-guide.dto';
import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Req, Query } from '@nestjs/common';
class CreateRestaurantRequest {
  @ValidateNested() @Type(() => CreateUserServiceDto)
  dto!: CreateUserServiceDto;
  @ValidateNested() @Type(() => CreateRestaurantDto)
  createRestaurantDto!: CreateRestaurantDto;
}

export class CreateHotelRequest {
  @ValidateNested() @Type(() => CreateUserServiceDto)
  dto!: CreateUserServiceDto;

  @ValidateNested() @Type(() => CreateHotelDto)
  createHotelDto!: CreateHotelDto;
}

class CreateCarRentalRequest {
  @ValidateNested() @Type(() => CreateUserServiceDto)
  dto!: CreateUserServiceDto;
  @ValidateNested() @Type(() => CreateCarRentalCenterDto)
  createCarRentalCenterDto!: CreateCarRentalCenterDto;
}
class CreateGuideRequest {
  @ValidateNested() @Type(() => CreateUserServiceDto)
  dto!: CreateUserServiceDto;
  @ValidateNested() @Type(() => CreateGuideDto)
  createGuideDto!: CreateGuideDto;
}

@Controller('user-services')
export class UserServicesController {
  constructor(private readonly userServicesService: UserServicesService) {}

  @Post('hotel')
  createHotelService(@Body() body: CreateHotelRequest) {
    return this.userServicesService.createHotelService(body.dto, body.createHotelDto);
  }

@Post('restaurant')
  createRestaurant(@Body() body: CreateRestaurantRequest) {
    return this.userServicesService.createRestaurantService(body.dto, body.createRestaurantDto);
  }

@Post('car-rental')
  createCarRental(@Body() body: CreateCarRentalRequest) {
    return this.userServicesService.createCarRentalService(body.dto, body.createCarRentalCenterDto);
  }

  @Post('guide')
  createGuide(@Body() body: CreateGuideRequest) {
    return this.userServicesService.createGuideService(body.dto, body.createGuideDto);
  }

  @Get()
  findAll() {
    return this.userServicesService.findAll();
  }

  @Get('owner')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('bearerAuth')
  findByOwner(@Req() req) {
    const id = req.user.id;
    return this.userServicesService.findByOwner(id);
  }

  @Get('type')
  findByType(@Query('type') type: string) {
    return this.userServicesService.findByType(type);
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
