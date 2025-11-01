import { Injectable } from '@nestjs/common';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GuideService {
  constructor(private prisma: PrismaService, private minioService: MinioService) {}
  async create(dto: CreateGuideDto) {
      try {
        return await this.prisma.guide.create({
          data: {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            image: dto.image,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException('guide id already exists');
        }
        else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
          console.log(e);
        }
        throw e;
      }
    }
  
  findAll() {
    return this.prisma.guide.findMany();
  }

  async findOne(id: string) {
    const location = await this.prisma.guide.findUnique({ where: { id } });
        if (!location) throw new NotFoundException('Guide not found');
        return location;
  }

  async update(id: string, dto: UpdateGuideDto) {
    const existing = await this.prisma.guide.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Guide not found');
        }
        return this.prisma.guide.update({
            where: { id },
            data: {
              id: dto.id,
              name: dto.name,
              description: dto.description,
              image: dto.image,
          },
        });
  }

  async remove(id: string) {
    try {
        await this.prisma.guide.delete({ where: { id } });
        return { ok: true };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('guide not found');
        }
        throw e;
    }
  }


  async uploadGuideImages(guideId: string, profileImgs: Express.Multer.File[]) {
    const guide = await this.prisma.guide.findUnique({ where: { id: guideId } });
    if (!guide) {
      throw new NotFoundException('Guide not found');
    }

    const uploadResults: string[] = [];
    for (const file of profileImgs) {
      const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
      uploadResults.push(url);
    }
    const updatedGuide = await this.prisma.guide.update({
      where: { id: guideId },
      data: {
        pictures: {
          push: uploadResults,
        },
      },
    });

    return updatedGuide;
  }
}
