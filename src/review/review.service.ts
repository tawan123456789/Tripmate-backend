import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}
      
    //   async create(dto: CreateReviewDto) {
    //       try {
    //           return await this.prisma.review.create({
    //               data: {
    //                 id: dto.id,
    //                 serviceId: dto.serviceId,
    //                 userId: dto.userId,
    //                 comment: dto.comment,
    //                 score: dto.score,
    //                 image: dto.image,
    //                 status: dto.status,
    //               },
    //           });
    //       } catch (e) {
    //           if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
    //               throw new ConflictException('review ID ถูกใช้งานแล้ว');
    //           }
    //               }
    //   }

  findAll() {
    return `This action returns all review`;
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
}