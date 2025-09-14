import { Injectable } from '@nestjs/common';
import { CreateGuideDto } from './dto/create-guide.dto';
import { UpdateGuideDto } from './dto/update-guide.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';


@Injectable()
export class GuideService {
  constructor(private prisma: PrismaService) {}
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
    return `This action returns all guide`;
  }

  async findOne(id: string) {
    const location = await this.prisma.guide.findUnique({ where: { id } });
        if (!location) throw new NotFoundException('Location not found');
        return location;
  }

  async update(id: string, dto: UpdateGuideDto) {
    const existing = await this.prisma.guide.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Location not found');
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
}
