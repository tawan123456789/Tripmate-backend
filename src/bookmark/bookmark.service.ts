import { Injectable } from '@nestjs/common';
import { CreateBookmarkDto } from './dto/create-bookmark.dto';
import { UpdateBookmarkDto } from './dto/update-bookmark.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common';
import { randomAlphanumeric } from 'src/utils/random.util';

@Injectable()
export class BookmarkService {
  constructor(private prisma: PrismaService) {}
        
        async create(dto: CreateBookmarkDto) {
            try {
                                return await this.prisma.bookmark.create({
                                        data: {
                                    
                                            serviceId: dto.serviceId,
                                            userId: dto.userId,
                                            status: dto.status,
                                        },
                                });
            } catch (e) {
                if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                    throw new ConflictException('bookmark ID ถูกใช้งานแล้ว');
                }
                    }
        }



  findAll() {
    return `This action returns all bookmark`;
  }

  async findOne(id: string) {
      const location = await this.prisma.bookmark.findUnique({ where: { id } });
          if (!location) throw new NotFoundException('Bookmark not found');
          return location;
    }
  
    async update(id: string, dto: UpdateBookmarkDto) {
      const existing = await this.prisma.bookmark.findUnique({ where: { id } });
          if (!existing) {
              throw new NotFoundException('Location not found');
          }
          return this.prisma.bookmark.update({
              where: { id },
              data: {
                serviceId: dto.serviceId,
                userId: dto.userId,
                status: dto.status,
            },
          });
    }
  
    async remove(id: string) {
      try {
          await this.prisma.bookmark.delete({ where: { id } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('restaurant not found');
          }
          throw e;
      }
    }
}
