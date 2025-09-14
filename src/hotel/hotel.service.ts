import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateHotelDto) {
      try {
        return await this.prisma.hotel.create({
          data: {
            id: dto.id,
            name: dto.name,
            description: dto.description,
            facility: dto.facility,
            image: dto.image,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException('hotel id user email already exists');
        }
        else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
          console.log(e);
        }
        throw e;
      }
    }
  

  findAll() {
    return `This action returns all hotel`;
  }

  async findOne(id: string) {
    const location = await this.prisma.hotel.findUnique({ where: { id } });
        if (!location) throw new NotFoundException('Location not found');
        return location;
  }

  async update(id: string, dto: UpdateHotelDto) {
    const existing = await this.prisma.hotel.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Location not found');
        }
        return this.prisma.hotel.update({
            where: { id },
            data: {
              id: dto.id,
              name: dto.name,
              description: dto.description,
              facility: dto.facility,
              image: dto.image,
          },
        });
  }

  async remove(id: string) {
    try {
        await this.prisma.hotel.delete({ where: { id } });
        return { ok: true };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('hotel not found');
        }
        throw e;
    }
  }
}
