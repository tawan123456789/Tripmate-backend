import { Injectable, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private readonly logger = new Logger(MinioService.name);
  private minioClient: Minio.Client;

  constructor() {
    this.minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT || '9000'),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'miniopassword',
    });

    this.initializeBuckets();
  }

  private async initializeBuckets() {
    const buckets = ['images', 'documents', 'avatars'];
    
    for (const bucketName of buckets) {
      try {
        const exists = await this.minioClient.bucketExists(bucketName);
        if (!exists) {
          await this.minioClient.makeBucket(bucketName, 'us-east-1');
          this.logger.log(`Bucket ${bucketName} created successfully`);
        }
      } catch (error) {
        this.logger.error(`Error creating bucket ${bucketName}:`, error);
      }
    }
  }

  async uploadFile(
    bucketName: string,
    fileName: string,
    file: Buffer,
    contentType: string = 'application/octet-stream'
  ): Promise<string> {
    try {
      const metaData = {
        'Content-Type': contentType,
      };

      await this.minioClient.putObject(bucketName, fileName, file, file.length, metaData);
      this.logger.log(`File ${fileName} uploaded to bucket ${bucketName}`);
      
      // Generate URL for the uploaded file
      return await this.getFileUrl(bucketName, fileName);
    } catch (error) {
      this.logger.error(`Error uploading file ${fileName}:`, error);
      throw error;
    }
  }

  async getFileUrl(bucketName: string, fileName: string): Promise<string> {
    try {
      // Option 1: Presigned URL (expires in 24 hours)
      // return await this.minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
      
      // Option 2: Public URL (permanent, requires public bucket policy)
      const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
      const port = process.env.MINIO_PORT || '9000';
      const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
      return `${protocol}://${endpoint}:${port}/${bucketName}/${fileName}`;
    } catch (error) {
      this.logger.error(`Error getting file URL for ${fileName}:`, error);
      throw error;
    }
  }

  async deleteFile(bucketName: string, fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(bucketName, fileName);
      this.logger.log(`File ${fileName} deleted from bucket ${bucketName}`);
    } catch (error) {
      this.logger.error(`Error deleting file ${fileName}:`, error);
      throw error;
    }
  }

  async uploadImage(file: Buffer, fileName: string, contentType: string): Promise<string> {
    return this.uploadFile('images', fileName, file, contentType);
  }

  async uploadAvatar(file: Buffer, fileName: string, contentType: string): Promise<string> {
    return this.uploadFile('avatars', fileName, file, contentType);
  }

  async uploadDocument(file: Buffer, fileName: string, contentType: string): Promise<string> {
    return this.uploadFile('documents', fileName, file, contentType);
  }
}