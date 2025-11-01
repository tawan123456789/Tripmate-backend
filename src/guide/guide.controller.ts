import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GuideService } from './guide.service';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { UseInterceptors } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { UploadedFiles } from '@nestjs/common/decorators';
import { ApiConsumes, ApiBody } from '@nestjs/swagger';

@Controller('guide')
export class GuideController {
  constructor(private readonly guideService: GuideService) {}

  @Post()
  create(@Body() createGuideDto: CreateGuideDto) {
    return this.guideService.create(createGuideDto);
  }

  @Get()
  findAll() {
    return this.guideService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.guideService.findOne(id);
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
