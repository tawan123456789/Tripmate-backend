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
      // ตรวจว่าศูนย์เช่ามีจริง
      const crc = await this.prisma.carRentalCenter.findUnique({
        where: { id: dto.crcId },
        select: { id: true },
      });
      if (!crc) {
        throw new NotFoundException(`CarRentalCenter not found: ${dto.crcId}`);
      }

      // สร้างรถใหม่
      const car = await this.prisma.car.create({
        data: {
          id: dto.id,
          name: dto.name,            // ✅ ต้องมี
          crcId: dto.crcId,

          model: dto.model,
          description: dto.description,
          seats: dto.seats,
          image: dto.image,
          brand: dto.brand,
          currency: dto.currency,
          doors: dto.doors,
          features: dto.features,
          fuelType: dto.fuelType,
          luggage: dto.luggage,
          mileageLimitKm: dto.mileageLimitKm,
          pictures: dto.pictures,
          transmission: dto.transmission,
          year: dto.year,
          availability: dto.availability as any,
          insurance: dto.insurance as any,

          // ✅ แปลง Decimal อย่างปลอดภัย (ส่งเฉพาะตอนมีค่า)
          ...(dto.pricePerDay  != null && { pricePerDay:  new Prisma.Decimal(dto.pricePerDay) }),
          ...(dto.pricePerHour != null && { pricePerHour: new Prisma.Decimal(dto.pricePerHour) }),
          ...(dto.deposit      != null && { deposit:      new Prisma.Decimal(dto.deposit) }),
        },
      });

      return car;
    }

  findAll() {
    return this.prisma.car.findMany();
  }

  async findOne(id: string) {
      const location = await this.prisma.car.findUnique({ where: { id } });
          if (!location) throw new NotFoundException('Service not found');
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
