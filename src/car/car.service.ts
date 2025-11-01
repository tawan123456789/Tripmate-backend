import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class CarService {
  constructor(private prisma: PrismaService,
    private minioService: MinioService,
  ) {}
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
          // id: dto.id, // ถ้าจำเป็นต้องเปลี่ยนจริง ๆ ค่อยเปิดบรรทัดนี้
    name: dto.name,
    crcId: dto.crcId,

    // ====== ฟิลด์ตามสคีมา ======
    type: dto.type,
    model: dto.model,
    description: dto.description,
    seats: dto.seats,
    pictures: dto.pictures,          // [] จะยังถูกส่งได้ (เพราะไม่ใช่ undefined)
    pricePerDay: dto.pricePerDay,
    pricePerHour: dto.pricePerHour,
    brand: dto.brand,
    currency: dto.currency,
    deposit: dto.deposit,
    doors: dto.doors,
    features: dto.features,          // [] จะยังถูกส่งได้
    fuelType: dto.fuelType,
    fuelPolicy: dto.fuelPolicy,
    pickupLocation: dto.pickupLocation,
    luggage: dto.luggage,
    mileageLimitKm: dto.mileageLimitKm,
    transmission: dto.transmission,
    year: dto.year,
    availability: dto.availability,  // JSON
    insurance: dto.insurance,        // JSON
    }
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

  async uploadCarImages(carId: string, profileImgs: Express.Multer.File[]) {
    const car = await this.prisma.car.findUnique({ where: { id: carId } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }

    const uploadResults: string[] = [];
    for (const file of profileImgs) {
      const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
      uploadResults.push(url);
    }
    const updatedCar = await this.prisma.car.update({
      where: { id: carId },
      data: {
        pictures: {
          push: uploadResults,
        },
      },
    });
    return updatedCar;
  }





}
