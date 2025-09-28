import { 
  Controller, 
  Post, 
  UploadedFile, 
  UploadedFiles,
  UseInterceptors, 
  Body,
  Param,
  Delete,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserProfileService } from '../users/user-profile.service';
import { HotelImageService } from '../hotel/hotel-image.service';
import { TripMediaService } from '../trip/trip-media.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly userProfileService: UserProfileService,
    private readonly hotelImageService: HotelImageService,
    private readonly tripMediaService: TripMediaService,
  ) {}

  // อัพโหลดรูปโปรไฟล์
  @Post('user/:userId/profile-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadUserProfile(
    @Param('userId') userId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const imageUrl = await this.userProfileService.uploadProfileImage(file, userId);
    return {
      success: true,
      message: 'Profile image uploaded successfully',
      imageUrl,
    };
  }

  // อัพโหลดรูปโรงแรม (หลายรูป)
  @Post('hotel/:hotelId/images')
  @UseInterceptors(FilesInterceptor('images', 10)) // สูงสุด 10 รูป
  async uploadHotelImages(
    @Param('hotelId') hotelId: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const imageUrls = await this.hotelImageService.uploadHotelImages(files, hotelId);
    await this.hotelImageService.saveHotelImagesInDatabase(hotelId, imageUrls);
    
    return {
      success: true,
      message: `${imageUrls.length} images uploaded successfully`,
      imageUrls,
    };
  }

  // อัพโหลดรูป trip
  @Post('trip/:tripId/image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadTripImage(
    @Param('tripId') tripId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const imageUrl = await this.tripMediaService.uploadTripImage(file, tripId);
    return {
      success: true,
      message: 'Trip image uploaded successfully',
      imageUrl,
    };
  }

  // อัพโหลดเอกสาร trip
  @Post('trip/:tripId/document')
  @UseInterceptors(FileInterceptor('document'))
  async uploadTripDocument(
    @Param('tripId') tripId: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const documentUrl = await this.tripMediaService.uploadTripDocument(file, tripId);
    return {
      success: true,
      message: 'Trip document uploaded successfully',
      documentUrl,
    };
  }

  // สร้าง trip gallery
  @Post('trip/:tripId/gallery')
  @UseInterceptors(FilesInterceptor('images', 20)) // สูงสุด 20 รูป
  async createTripGallery(
    @Param('tripId') tripId: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    const imageUrls = await this.tripMediaService.createTripGallery(files, tripId);
    return {
      success: true,
      message: `${imageUrls.length} images uploaded to gallery`,
      imageUrls,
    };
  }

  // ลบรูป
  @Delete('image')
  async deleteImage(@Body('imageUrl') imageUrl: string) {
    // กำหนดว่ารูปนี้เป็นของ service ไหน
    if (imageUrl.includes('/avatars/')) {
      await this.userProfileService.deleteOldProfileImage(imageUrl);
    } else if (imageUrl.includes('/images/')) {
      await this.tripMediaService.removeTripImage(imageUrl);
    }
    
    return {
      success: true,
      message: 'Image deleted successfully',
    };
  }
}