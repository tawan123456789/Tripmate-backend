import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';
import { randomAlphanumeric } from '../utils/random.util';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('upload')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only image files are allowed');
    }

    const fileName = `${Date.now()}-${randomAlphanumeric(8)}.${file.originalname.split('.').pop()}`;
    
    try {
      const url = await this.minioService.uploadImage(
        file.buffer,
        fileName,
        file.mimetype
      );

      return {
        message: 'Image uploaded successfully',
        fileName,
        url,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload image');
    }
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG and PNG images are allowed for avatars');
    }

    const fileName = `avatar-${Date.now()}-${randomAlphanumeric(8)}.${file.originalname.split('.').pop()}`;
    
    try {
      const url = await this.minioService.uploadAvatar(
        file.buffer,
        fileName,
        file.mimetype
      );

      return {
        message: 'Avatar uploaded successfully',
        fileName,
        url,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload avatar');
    }
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const allowedMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF, DOC, DOCX, and TXT files are allowed');
    }

    const fileName = `doc-${Date.now()}-${randomAlphanumeric(8)}.${file.originalname.split('.').pop()}`;
    
    try {
      const url = await this.minioService.uploadDocument(
        file.buffer,
        fileName,
        file.mimetype
      );

      return {
        message: 'Document uploaded successfully',
        fileName,
        url,
        size: file.size,
        mimetype: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException('Failed to upload document');
    }
  }
}