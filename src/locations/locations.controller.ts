import { Controller, Get, Post, Body, Param, Delete, Patch, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { NearbyLocationDto } from './dto/nearby-location.dto';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  create(@Body() dto: CreateLocationDto) {
    return this.locationsService.create(dto);
  }

  @Get('nearby')
    async nearby(@Query() q: NearbyLocationDto) {
      return this.locationsService.findNearby(q);
    }
  
    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.locationsService.findOne(id);
    }
  
    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateLocationDto) {
      return this.locationsService.update(id, dto);
    }
  
    @Delete(':id')
    remove(@Param('id') id: string) {
      return this.locationsService.remove(id);
    }
}