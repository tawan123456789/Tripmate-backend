import { Injectable } from '@nestjs/common';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class GuideService {
    private toDec(v?: string) {
    return v !== undefined ? new Prisma.Decimal(v) : undefined;
  }

    private toJson(v: unknown): Prisma.InputJsonValue | undefined {
    if (v === undefined) return undefined;
    return instanceToPlain(v) as Prisma.InputJsonValue;
  }
  constructor(private prisma: PrismaService, private minioService: MinioService) {}
  async create(dto: CreateGuideDto) {
    // ตรวจ FK userService.id = dto.id ตาม schema ของคุณก่อน ถ้าต้องการ
    return this.prisma.guide.create({
      data: {
        id: dto.id,
        name: dto.name,
        description: dto.description ?? undefined,
        image: dto.image ?? undefined,

        rating: this.toDec(dto.rating),
        pay: this.toDec(dto.pay),
        dayRate: this.toDec(dto.dayRate),
        hourlyRate: this.toDec(dto.hourlyRate),
        overtimeRate: this.toDec(dto.overtimeRate),
        currency: dto.currency ?? undefined,

        experienceYears: dto.experienceYears ?? undefined,
        verified: dto.verified ?? undefined,
        licenseId: dto.licenseId ?? undefined,

        languages: dto.languages ?? undefined,
        specialties: dto.specialties ?? undefined,
        regionsCovered: dto.regionsCovered ?? undefined,
        nearbyLocations: dto.nearbyLocations ?? undefined,
        pictures: dto.pictures ?? undefined,
        contacts: this.toJson(dto.contacts),
        availability: this.toJson(dto.availability),
        policies: this.toJson(dto.policies),
        subtopicRatings: this.toJson(dto.subtopicRatings),

        locationSummary: dto.locationSummary ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateGuideDto) {
    return this.prisma.guide.update({
      where: { id },
      data: {
        name: dto.name ?? undefined,
        description: dto.description ?? undefined,
        image: dto.image ?? undefined,

        rating: this.toDec(dto.rating),
        pay: this.toDec(dto.pay),
        dayRate: this.toDec(dto.dayRate),
        hourlyRate: this.toDec(dto.hourlyRate),
        overtimeRate: this.toDec(dto.overtimeRate),
        currency: dto.currency ?? undefined,

        experienceYears: dto.experienceYears ?? undefined,
        verified: dto.verified ?? undefined,
        licenseId: dto.licenseId ?? undefined,

        languages: dto.languages ?? undefined,
        specialties: dto.specialties ?? undefined,
        regionsCovered: dto.regionsCovered ?? undefined,
        nearbyLocations: dto.nearbyLocations ?? undefined,
        pictures: dto.pictures ?? undefined,

        contacts: dto.contacts === null ? Prisma.JsonNull : this.toJson(dto.contacts),
        availability: dto.availability === null ? Prisma.JsonNull : this.toJson(dto.availability),
        policies: dto.policies === null ? Prisma.JsonNull : this.toJson(dto.policies),
        subtopicRatings: dto.subtopicRatings === null ? Prisma.JsonNull : this.toJson(dto.subtopicRatings),

        locationSummary: dto.locationSummary ?? undefined,
      },
    });
  }

  findAll(req: any) {
    if(req.user.id){return this.prisma.guide.findMany({include: { service: { include: { reviews: true, location: true, bookmarks: {where : { userId: req.query.userId } } } } }});}
    return this.prisma.guide.findMany({include: { service: { include: { reviews: true, location: true } } }});
  }

  async findOne(id: string, req: any) {
    if(req.user.id){const location = await this.prisma.guide.findUnique({ where: { id }, include: { service: { include: { reviews: true, location: true, bookmarks: {where : { userId: req.query.userId } } } } } });
        if (!location) throw new NotFoundException('Guide not found');
        return location;}
    else{const location = await this.prisma.guide.findUnique({ where: { id }, include: { service: { include: { reviews: true, location: true, bookmarks: {where : { userId: req.query.userId } } } } } });
        if (!location) throw new NotFoundException('Guide not found');
        return location;}
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
