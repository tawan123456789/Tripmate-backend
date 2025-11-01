import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto ,CreateTripPlanDto} from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApiBody } from '@nestjs/swagger';
@Controller('trip')
export class TripController {
  constructor(private readonly tripService: TripService) {}

  @Post()
  @ApiBody({ type: CreateTripDto }) // สำคัญมาก!
  create(@Body() dto: CreateTripDto) {
    return this.tripService.create(dto);
  }

  @Get()
  findAll() {
    return this.tripService.findAll();
  }

  @Get('public')
  public() {
    return this.tripService.publicTrip();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tripService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.tripService.update(+id, updateTripDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tripService.remove(+id);
  }





}
