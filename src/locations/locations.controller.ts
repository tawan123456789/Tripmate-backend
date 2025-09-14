import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly usersService: LocationsService) {}

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.usersService.create(dto);
  }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.usersService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
      return this.usersService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.usersService.remove(id);
    }
}