import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { UseInterceptors } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common/decorators';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { CreateRoomOptionDto } from './dto/room-option.dto';
@Controller('room')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}
  
  @Post('add-room-options')
  addRoomOptions(@Body() roomId: string, hotelId: string, createRoomDto: CreateRoomOptionDto) {
    return this.roomService.addRoomOption(roomId, hotelId, createRoomDto);
  }
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

  // @Patch(':id/:hotel_id')
  // update(@Param('id') id: string,@Param('hotel_id') hotel_id: string, @Body() updateRoomDto: UpdateRoomDto) {
  //   return this.roomService.update(id,hotel_id, updateRoomDto);
  // }

  @Delete(':id/:hotel_id')
  remove(@Param('id') id: string,
        @Param('hotel_id') hotel_id: string
  ) 
  {
    return this.roomService.remove(id,hotel_id);
  }

  @Post('upload/:hotelId/:roomId')
  @UseInterceptors(FilesInterceptor('profileImg', 10))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profileImg: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
        },
      },
      required: ['profileImg'],
    },
  })
  uploadRoomImages(
    @Param('roomId') roomId: string,
    @Param('hotelId') hotelId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.roomService.uploadRoomImages(roomId, hotelId, files);
  }
}
