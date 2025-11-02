import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common';
import { randomAlphanumeric } from 'src/utils/random.util';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class ReviewService {
    constructor(private prisma: PrismaService, private minioService: MinioService) { }

    async create(dto: CreateReviewDto) {
        if (dto.status == "place") {
            const review = await this.prisma.review.create({
                data: {
                    id: randomAlphanumeric(12),
                    placeId: dto.placeId,
                    serviceId: null,
                    userId: dto.userId,
                    comment: dto.comment,
                    score1: dto.score1,
                    status: dto.status,
                    
                }
            });
            return review;
        }
        else{
            const review = await this.prisma.review.create({
                data: {
                    id: randomAlphanumeric(12),
                    placeId: null,
                    serviceId: dto.serviceId,
                    userId: dto.userId,
                    comment: dto.comment,
                    score1: dto.score1,
                    score2: dto.score2,
                    score3: dto.score3,
                    score4: dto.score4,
                    score5: dto.score5,
                    score6: dto.score6,
                    status: dto.status,
                }
            });

            return review;
        }
    }

    

    findAll() {
        return this.prisma.review.findMany();
    }

    async findOne(id: string) {
        const location = await this.prisma.review.findUnique({ where: { id } });
        if (!location) throw new NotFoundException('Location not found');
        return location;
    }

    // async update(id: string, dto: UpdateReviewDto) {
    //   const existing = await this.prisma.review.findUnique({ where: { id } });
    //       if (!existing) {
    //           throw new NotFoundException('Location not found');
    //       }
    //       return this.prisma.review.update({
    //           where: { id },
    //           data: {
    //             id: dto.id,
    //             serviceId: dto.serviceId,
    //             userId: dto.userId,
    //             comment: dto.comment,
    //             score: dto.score,
    //             image: dto.image,
    //             status: dto.status,
    //         },
    //       });
    // }

    async remove(id: string) {
        try {
            await this.prisma.review.delete({ where: { id } });
            return { ok: true };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('restaurant not found');
            }
            throw e;
        }
    }

    async uploadReviewImages(
        reviewId: string,
        profileImgs: Express.Multer.File[],
    ) {
        const existing = await this.prisma.review.findUnique({ where: { id: reviewId } });
        if (!existing) {
            throw new NotFoundException('Review not found');
        }
    const uploadResults: string[] = [];
    for (const file of profileImgs) {
      const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
      uploadResults.push(url);
    }
    const updateReview = await this.prisma.review.update({
        where: { id: reviewId },
        data: { image: { push: uploadResults } },
    });
    return updateReview;
}

    async getReviewHistory(
        userId: string,
        serviceTypeOrLocation: string,
    ) {
        const reviews = await this.prisma.review.findMany({
            where: {
                userId: userId,
                status: serviceTypeOrLocation
            }
        });
        return reviews;
    }

}
