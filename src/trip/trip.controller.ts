import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TripService } from './trip.service';
import { CreateTripDto ,CreateTripPlanDto} from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { ApiBody } from '@nestjs/swagger';
import { FrontCreateTripPayloadDto } from './dto/front-trip.dto';
import { ApiOperation } from '@nestjs/swagger';
import { Req, BadRequestException } from '@nestjs/common';
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

  @Post('frontend')
  @ApiOperation({ summary: 'Create trip from frontend payload' })
  @ApiBody({ type: FrontCreateTripPayloadDto })
  async createFromFrontend(@Body() payload: FrontCreateTripPayloadDto, @Req() req: any) {
    const ownerId = payload.ownerId ?? req?.user?.id;
    if (!ownerId) throw new BadRequestException('ownerId is required');
    return this.tripService.createFromFrontPayload({ ...payload, ownerId });
  }

  @Get(':id/frontend')
  @ApiOperation({ summary: 'Get trip as frontend shape' })
  async getAsFrontend(@Param('id') id: string) {
    return this.tripService.getTripAsFrontShape(id);
  }

  @Patch('private/:id/:status')
  @ApiBody({ type: String ,examples: {
    example1: {
      summary: 'Set to private',
      value: 'private',
    },
    example2: {
      summary: 'Set to public',
      value: 'public',
    },
  }})
  async editPrivateTripPlan(
    @Param('id') id: string,
    @Param('status') status: string
  ) {
    return this.tripService.setPrivateTripPlan(id, status);
  }


}
