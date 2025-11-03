import { Injectable } from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class DiscountService {
  constructor(private prisma: PrismaService) {}
         
         async create(dto: CreateDiscountDto) {
             try {
                 return await this.prisma.discount.create({
                     data: {
                        id: dto.id,
                        ownerId: dto.ownerId,
                        value: dto.value,
                        type: dto.type,
                        expiredAt: dto.expiredAt,
                        maker_id: dto.maker_id,
                     },
                 });
             } catch (e) {
                 if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                     throw new ConflictException('bookmark ID ถูกใช้งานแล้ว');
                 }
                     }
         }

  findAll() {
    return this.prisma.discount.findMany();
  }

  async findOne(id: string) {
      const location = await this.prisma.discount.findUnique({ where: { id } });
          if (!location) throw new NotFoundException('Discount not found');
          return location;
    }
  
    async update(id: string, dto: UpdateDiscountDto) {
      const existing = await this.prisma.discount.findUnique({ where: { id } });
          if (!existing) {
              throw new NotFoundException('Location not found');
          }
          return this.prisma.discount.update({
              where: { id },
              data: {
                id: dto.id,
                ownerId: dto.ownerId,
                value: dto.value,
                type: dto.type,
                expiredAt: dto.expiredAt,
                maker_id: dto.maker_id,
            },
          });
    }
  
    async remove(id: string) {
      try {
          await this.prisma.discount.delete({ where: { id } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('discount not found');
          }
          throw e;
      }
    }
}

