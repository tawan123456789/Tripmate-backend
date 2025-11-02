import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuideService } from './guide.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { Req, UseGuards, UseInterceptors } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common/decorators';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard, JwtToken } from 'src/auth/guards/jwt-auth.guard';

@Controller('guide')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  @Post()
  create(@Body() createGuideDto: CreateGuideDto) {
    return this.guideService.create(createGuideDto);
  }

  @Get()
  @UseGuards(JwtToken)
  findAll(@Req() req: any) {
    return this.guideService.findAll(req);
  }

  @Get(':id')
  @UseGuards(JwtToken)
  findOne(@Param('id') id: string, @Req() req: any) {
    return this.guideService.findOne(id, req);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGuideDto: UpdateGuideDto) {
    return this.guideService.update(id, updateGuideDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.guideService.remove(id);
  }

  @Post('upload/:guideId')
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
  uploadGuideImages(
    @Param('guideId') guideId: string,
    @UploadedFiles() profileImgs: Express.Multer.File[],
  ) {
    return this.guideService.uploadGuideImages(guideId, profileImgs);
  }
  
}
