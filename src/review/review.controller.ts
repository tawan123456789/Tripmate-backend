import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto ,reviewExamples} from './dto/update-review.dto';
import { ApiBody } from '@nestjs/swagger';
import { UseInterceptors } from '@nestjs/common/decorators';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { UploadedFiles } from '@nestjs/common/decorators';
import { ApiOperation } from '@nestjs/swagger';
@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) { }

  @Post()
  @ApiOperation({ summary: 'Get trip as frontend shape' })
  @ApiBody({
    type: CreateReviewDto, examples: reviewExamples})
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewService.create(createReviewDto);
  }

  @Get()
  findAll() {
    return this.reviewService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Review ' })
  @ApiBody({ type: UpdateReviewDto ,description:'Update Review DTO'})
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string' },
        placeId: { type: 'string' },
        serviceId: { type: 'string' },
        comment: { type: 'string' },
        score1: { type: 'number' },
        score2: { type: 'number' },
        score3: { type: 'number' },
        score4: { type: 'number' },
        score5: { type: 'number' },
        score6: { type: 'number' },
        status: { type: 'string' },
        image: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  async update(
    @Param('id') id: string,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    console.log('UpdateReviewDto received in controller:', updateReviewDto.image);
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewService.remove(id);
  }

  @Post('upload/:reviewId')
  @ApiOperation({ summary: 'Upload Review Images' })
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
  uploadReviewImages(
    @Param('reviewId') reviewId: string,
    @UploadedFiles() profileImg: Express.Multer.File[],
  ) {
    return this.reviewService.uploadReviewImages(reviewId, profileImg);
  }


  // @Get('history/:userId/:serviceTypeOrLocation')
  getReviewHistory(
    @Param('userId') userId: string,
    @Param('serviceTypeOrLocation') serviceTypeOrLocation: string,
  ) {
    return this.reviewService.getReviewHistory(userId, serviceTypeOrLocation);
  }

}
