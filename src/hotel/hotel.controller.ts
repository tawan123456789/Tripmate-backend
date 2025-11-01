import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { UseInterceptors } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common/decorators';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Req } from '@nestjs/common/decorators';

@Controller('hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post()
  create(@Body() createHotelDto: CreateHotelDto) {
    return this.hotelService.create(createHotelDto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.hotelService.findAll(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.hotelService.findOne(id, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHotelDto: UpdateHotelDto) {
    return this.hotelService.update(id, updateHotelDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelService.remove(id);
  }

  @Post('add-room')
  addRoom(@Body() createRoomDto: CreateRoomDto) {
    return this.hotelService.addRoom(createRoomDto);
  }

  @Post('upload/:hotelId')
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
  uploadHotelImages(
    @Param('hotelId') hotelId: string,
    @UploadedFiles() profileImgs: Express.Multer.File[],
  ) {
    return this.hotelService.uploadHotelImages(hotelId, profileImgs);
  }

}
