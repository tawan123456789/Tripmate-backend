import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCarRentalCenterDto } from './dto/create-car_rental_center.dto';
import { UpdateCarRentalCenterDto } from './dto/update-car_rental_center.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCarDto } from 'src/car/dto/create-car.dto';

@Injectable()
export class CarRentalCenterService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateCarRentalCenterDto) {
    try {
          return await this.prisma.carRentalCenter.create({
            data: {
              id: dto.id,
              name: dto.name,
              description: dto.description,
              image: dto.image
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('id already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
  }

  findAll() {
    return this.prisma.carRentalCenter.findMany();
  }

async findOne(id: string) {
    const crc = await this.prisma.carRentalCenter.findUnique({ where: { id } });
    if (!crc) throw new NotFoundException('Rental center not found');
    return crc;
  }

  async update(id: string, dto: UpdateCarRentalCenterDto) {
    try {
      
      return await this.prisma.carRentalCenter.update({
        where: { id },
        data: { ...dto, id: undefined } as any,
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('car rental center not found');
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('car rental center already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.carRentalCenter.delete({ where: { id } });
      return { ok: true };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('car rental center not found');
      }
      throw e;
    }
  }

  async addCar(dto : CreateCarDto) {
    try {
      return await this.prisma.car.create({
        data: {
          ...dto,// ให้ DB/Prisma gen เอง
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('car already exists');
      }
      throw e;
    }
  }
}
