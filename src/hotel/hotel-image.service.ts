import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { PrismaService } from '../prisma/prisma.service';
import { randomAlphanumeric } from '../utils/random.util';

@Injectable()
export class HotelImageService {
  constructor(
    private readonly minioService: MinioService,
    private readonly prisma: PrismaService,
  ) {}

  // อัพโหลดรูปโรงแรมหลายรูป
  async uploadHotelImages(files: Express.Multer.File[], hotelId: string): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const file of files) {
      // ตรวจสอบประเภทไฟล์
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimeTypes.includes(file.mimetype)) {
        throw new BadRequestException(`Invalid file type: ${file.mimetype}`);
      }

      // สร้างชื่อไฟล์
      const fileName = `hotel-${hotelId}-${Date.now()}-${randomAlphanumeric(8)}.${file.originalname.split('.').pop()}`;
      
      try {
        // อัพโหลดไปยัง MinIO
        const imageUrl = await this.minioService.uploadImage(
          file.buffer,
          fileName,
          file.mimetype
        );
        
        imageUrls.push(imageUrl);
      } catch (error) {
        throw new BadRequestException(`Failed to upload image: ${file.originalname}`);
      }
    }

    return imageUrls;
  }

  // บันทึกรูปไปยังฐานข้อมูล
  async saveHotelImagesInDatabase(hotelId: string, imageUrls: string[]): Promise<void> {
    try {
      // สมมติว่ามีตาราง HotelImage
      const imageRecords = imageUrls.map(url => ({
        hotelId,
        imageUrl: url,
        uploadedAt: new Date(),
      }));

      // บันทึกลงฐานข้อมูล (ปรับตาม schema จริง)
      // await this.prisma.hotelImage.createMany({
      //   data: imageRecords,
      // });
      
      console.log('Images saved to database:', imageRecords);
    } catch (error) {
      throw new BadRequestException('Failed to save images to database');
    }
  }

  // ลบรูปโรงแรม
  async deleteHotelImage(imageUrl: string): Promise<void> {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await this.minioService.deleteFile('images', fileName);
        
        // ลบจากฐานข้อมูลด้วย
        // await this.prisma.hotelImage.delete({
        //   where: { imageUrl }
        // });
      }
    } catch (error) {
      throw new BadRequestException('Failed to delete image');
    }
  }
}