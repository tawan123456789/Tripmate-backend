import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { randomAlphanumeric } from '../utils/random.util';

@Injectable()
export class TripMediaService {
  constructor(private readonly minioService: MinioService) {}

  // อัพโหลดรูปภาพสำหรับ trip
  async uploadTripImage(file: Express.Multer.File, tripId: string): Promise<string> {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const fileName = `trip-${tripId}-${Date.now()}-${randomAlphanumeric(6)}.${file.originalname.split('.').pop()}`;
    
    try {
      return await this.minioService.uploadImage(
        file.buffer,
        fileName,
        file.mimetype
      );
    } catch (error) {
      throw new BadRequestException('Failed to upload trip image');
    }
  }

  // อัพโหลดเอกสารสำหรับ trip
  async uploadTripDocument(file: Express.Multer.File, tripId: string): Promise<string> {
    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF and DOC files are allowed');
    }

    const fileName = `trip-doc-${tripId}-${Date.now()}-${randomAlphanumeric(6)}.${file.originalname.split('.').pop()}`;
    
    try {
      return await this.minioService.uploadDocument(
        file.buffer,
        fileName,
        file.mimetype
      );
    } catch (error) {
      throw new BadRequestException('Failed to upload trip document');
    }
  }

  // สร้าง gallery สำหรับ trip
  async createTripGallery(files: Express.Multer.File[], tripId: string): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const file of files) {
      try {
        const imageUrl = await this.uploadTripImage(file, tripId);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Failed to upload ${file.originalname}:`, error);
        // ข้ามไฟล์ที่อัพโหลดไม่ได้
      }
    }

    return imageUrls;
  }

  // ลบรูปจาก trip gallery
  async removeTripImage(imageUrl: string): Promise<void> {
    try {
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await this.minioService.deleteFile('images', fileName);
      }
    } catch (error) {
      throw new BadRequestException('Failed to delete trip image');
    }
  }
}