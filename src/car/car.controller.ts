import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { UseInterceptors } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common/decorators';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
@Controller('car')
export class CarController {
  constructor(private readonly carService: CarService) {}

  @Post()
  create(@Body() createCarDto: CreateCarDto) {
    return this.carService.create(createCarDto);
  }

  @Get()
  findAll() {
    return this.carService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateCarDto })
  update(@Param('id') id: string, @Body() updateCarDto: UpdateCarDto) {
    return this.carService.update(id, updateCarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carService.remove(id);
  }




@Post('upload/:carId')
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
uploadCarImages(
  @Param('carId') carId: string,
  @UploadedFiles() profileImgs: Express.Multer.File[],
) {
  return this.carService.uploadCarImages(carId, profileImgs);
}








}
