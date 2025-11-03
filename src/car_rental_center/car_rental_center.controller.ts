import { Controller, Get, Post, Body, Patch, Param, Delete ,UploadedFiles} from '@nestjs/common';
import { CarRentalCenterService } from './car_rental_center.service';
import { CreateCarRentalCenterDto } from './dto/create-car_rental_center.dto';
import { UpdateCarRentalCenterDto } from './dto/update-car_rental_center.dto';
import { CreateCarDto } from 'src/car/dto/create-car.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UseInterceptors, UploadedFile, Req, UseGuards } from '@nestjs/common/decorators';
import { ApiBody, ApiConsumes,ApiProperty } from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UserJoinGroup } from 'src/user_join_group/entities/user_join_group.entity';
import { JwtToken } from 'src/auth/guards/jwt-auth.guard';
@Controller('car-rental-center')
export class CarRentalCenterController {
  constructor(private readonly carRentalCenterService: CarRentalCenterService) {}

  @Post()
  create(@Body() createCarRentalCenterDto: CreateCarRentalCenterDto) {
    return this.carRentalCenterService.create(createCarRentalCenterDto);
  }

  @Get()
  @UseGuards(JwtToken)
  findAll(@Req() req: any) {
    return this.carRentalCenterService.findAll(req);
  }

  @Get(':id')
  @UseGuards(JwtToken)
  findOne(@Param('id') id: string,@Req() req: any) {  
    return this.carRentalCenterService.findOne(id, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCarRentalCenterDto: UpdateCarRentalCenterDto) {
    return this.carRentalCenterService.update(id, updateCarRentalCenterDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.carRentalCenterService.remove(id);
  }

  @Post('add-car')
  addCar(@Body() CreateCarDto: CreateCarDto) {
    return this.carRentalCenterService.addCar(CreateCarDto);
  }

  @Post('add-another-service/:centerId')
  addAnotherService(@Param('centerId') centerId: string, @Body() createCarRentalCenterDto: { service: string, price: number }) {
    return this.carRentalCenterService.addAnotherService(centerId, createCarRentalCenterDto.service, createCarRentalCenterDto.price);
  }

  @Get('car/:centerId')
  getCars(@Param('centerId') centerId: string) {
    return this.carRentalCenterService.getCarsByCenter(centerId);
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
        items: { type: 'string', format: 'binary' }, // <-- ทำให้เป็นช่องเลือกหลายไฟล์
      },
    },
    required: ['profileImg'], // เอาออกได้ถ้าไม่บังคับ
  },
})
uploadCarImages(
  @Param('carId') carId: string,
  @UploadedFiles() profileImgs: Express.Multer.File[],
) {
  return this.carRentalCenterService.uploadCarImages(carId, profileImgs);
}



@Get('rating/:carId')
rateCar(@Param('carId') carId: string) {
  return this.carRentalCenterService.rateCar(carId);
}



}


