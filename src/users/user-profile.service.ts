import { Injectable, BadRequestException } from '@nestjs/common';
import { MinioService } from '../minio/minio.service';
import { randomAlphanumeric } from '../utils/random.util';

@Injectable()
export class UserProfileService {
  constructor(private readonly minioService: MinioService) {}

  // อัพโหลดรูปโปรไฟล์
  async uploadProfileImage(file: Express.Multer.File, userId: string): Promise<string> {
    // ตรวจสอบประเภทไฟล์
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    // สร้างชื่อไฟล์ใหม่
    const fileName = `profile-${userId}-${Date.now()}-${randomAlphanumeric(6)}.${file.originalname.split('.').pop()}`;
    
    try {
      // อัพโหลดไปยัง MinIO
      const imageUrl = await this.minioService.uploadAvatar(
        file.buffer,
        fileName,
        file.mimetype
      );
      
      return imageUrl;
    } catch (error) {
      throw new BadRequestException('Failed to upload profile image');
    }
  }

  // ลบรูปโปรไฟล์เก่า
  async deleteOldProfileImage(imageUrl: string): Promise<void> {
    try {
      // แยก filename จาก URL
      const fileName = imageUrl.split('/').pop();
      if (fileName) {
        await this.minioService.deleteFile('avatars', fileName);
      }
    } catch (error) {
      console.log('Failed to delete old image:', error);
      // ไม่ throw error เพราะไม่ใช่ critical
    }
  }

  // ดาวน์โหลดรูป
  async getProfileImageUrl(fileName: string): Promise<string> {
    try {
      return await this.minioService.getFileUrl('avatars', fileName);
    } catch (error) {
      throw new BadRequestException('Failed to get image URL');
    }
  }
}