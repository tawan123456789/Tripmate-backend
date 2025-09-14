import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserServicesService } from './user-services.service';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';

@Controller('user-services')
export class UserServicesController {
  constructor(private readonly userServicesService: UserServicesService) {}

  @Post()
  create(@Body() createUserServiceDto: CreateUserServiceDto) {
    return this.userServicesService.create(createUserServiceDto);
  }

  @Get()
  findAll() {
    return this.userServicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userServicesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserServiceDto: UpdateUserServiceDto) {
    return this.userServicesService.update(id, updateUserServiceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userServicesService.remove(id);
  }
}
