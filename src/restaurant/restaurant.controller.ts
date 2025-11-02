import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Req } from '@nestjs/common/decorators';
import { UseGuards } from '@nestjs/common/decorators';
import { JwtToken } from 'src/auth/guards/jwt-auth.guard';

@Controller('restaurant')
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Post()
  create(@Body() createRestaurantDto: CreateRestaurantDto) {
    return this.restaurantService.create(createRestaurantDto);
  }

  @Get()
  @UseGuards(JwtToken)
  findAll(@Req() req: any) {
    return this.restaurantService.findAll(req);
  }

  @Get(':id')
  @UseGuards(JwtToken)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.restaurantService.findOne(id, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRestaurantDto: UpdateRestaurantDto) {
    return this.restaurantService.update(id, updateRestaurantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.restaurantService.remove(id);
  }
}
