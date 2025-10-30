import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class CarService {
  constructor(private prisma: PrismaService) {}
    async create(dto: CreateCarDto) {
        try {
          return await this.prisma.car.create({
            data: {
              id: dto.id,
              pricePerDay: dto.pricePerDay,
              model: dto.model,
              description: dto.description,
              seats: dto.seats,
              image: dto.image,
              crcId: dto.crcId,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('car id user email already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
      }

  findAll() {
    return `This action returns all car`;
  }

  async findOne(id: string) {
      const location = await this.prisma.car.findUnique({ where: { id } });
          if (!location) throw new NotFoundException('Location not found');
          return location;
    }
  
    async update(id: string, dto: UpdateCarDto) {
      const existing = await this.prisma.car.findUnique({ where: { id } });
          if (!existing) {
              throw new NotFoundException('Car not found');
          }
          return this.prisma.car.update({
              where: { id },
              data: {
                id: dto.id,
                pricePerDay: dto.pricePerDay,
                model: dto.model,
                description: dto.description,
                seats: dto.seats,
                image: dto.image,
                crcId: dto.crcId,
            },
          });
    }
  
    async remove(id: string) {
      try {
          await this.prisma.car.delete({ where: { id } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('car not found');
          }
          throw e;
      }
    }
}
