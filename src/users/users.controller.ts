import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseInterceptors, UploadedFile, UseGuards, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto,ChangePasswordDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard, JwtToken } from '../auth/guards/jwt-auth.guard';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('q') q?: string,
  ) {
    return this.usersService.findAll({ page: Number(page), pageSize: Number(pageSize), q });
  }

  @Get(':id')
  @UseGuards(JwtToken)
  @ApiBearerAuth('bearerAuth')
  findOne(@Param('id') id: string, @Req() req: any) {
    console.log("Request User:", req.user?.id);
    return this.usersService.findOne(id, req);
  }



  @Patch(':id')
  @ApiBody({ type: UpdateUserDto })
  async editProfile(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }



  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  
  @Patch(':id/password')
  changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(id, dto);
  }


    @Post('upload/:userId')
    @UseInterceptors(FileInterceptor('profileImg'))
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
    uploadUserImages(
      @Param('userId') userId: string,
      @UploadedFile() profileImg: Express.Multer.File,
    ) {
      return this.usersService.uploadUserImages(userId, profileImg);
    }

  @Get('bookmark/:userId/:type')
  findBookmarks(@Param('userId') userId: string, @Param('type') type: string) {
    return this.usersService.findBookmarks(userId, type);
  }

  @Get('review/:userId/:type')
  findReviews(@Param('userId') userId: string, @Param('type') type: string) {
    return this.usersService.findReviews(userId, type);
  }

}
