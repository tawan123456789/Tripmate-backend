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

  async rateGuide(guideId: string) {
    
    const reviews = await this.prisma.review.findMany({
        where: {
            serviceId: guideId,
            status: "guide"
        }
    });
    if (reviews.length === 0) {
        return 0;
    }
    const avgScore1 = reviews.reduce((sum, review) => sum + (review.score1 ?? 0), 0) / reviews.length;
    const avgScore2 = reviews.reduce((sum, review) => sum + (review.score2 ?? 0), 0) / reviews.length;
    const avgScore3 = reviews.reduce((sum, review) => sum + (review.score3 ?? 0), 0) / reviews.length;
    const avgScore4 = reviews.reduce((sum, review) => sum + (review.score4 ?? 0), 0) / reviews.length;
    const avgScore5 = reviews.reduce((sum, review) => sum + (review.score5 ?? 0), 0) / reviews.length;
    const avgScore6 = reviews.reduce((sum, review) => sum + (review.score6 ?? 0), 0) / reviews.length;
    const overallRating = (avgScore1 + avgScore2 + avgScore3 + avgScore4 + avgScore5 + avgScore6) / 6;

    return{
        id: guideId,
        overallRating: parseFloat(overallRating.toFixed(1)),
        subtopicRatings: {
            score1: parseFloat(avgScore1.toFixed(1)),
            score2: parseFloat(avgScore2.toFixed(1)),
            score3: parseFloat(avgScore3.toFixed(1)),
            score4: parseFloat(avgScore4.toFixed(1)),
            score5: parseFloat(avgScore5.toFixed(1)),
            score6: parseFloat(avgScore6.toFixed(1)),
        },
    };

  }
}
