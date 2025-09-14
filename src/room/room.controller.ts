import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';

@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  create(@Body() createRoomDto: CreateRoomDto) {
    return this.roomService.create(createRoomDto);
  }

  @Get()
  findAll() {
    return this.roomService.findAll();
  }

  @Get(':id/:hotelId')
  findOne(@Param('id') id: string,@Param('hotelId') hotel_id: string) {
    return this.roomService.findOne(id,hotel_id);
  }

  @Patch(':id/:hotel_id')
  update(@Param('id') id: string,@Param('hotel_id') hotel_id: string, @Body() updateRoomDto: UpdateRoomDto) {
    return this.roomService.update(id,hotel_id, updateRoomDto);
  }

  @Delete(':id/:hotel_id')
  remove(@Param('id') id: string,
        @Param('hotel_id') hotel_id: string
  ) 
  {
    return this.roomService.remove(id,hotel_id);
  }
}
