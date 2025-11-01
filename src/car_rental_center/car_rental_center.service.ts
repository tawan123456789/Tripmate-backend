import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateCarRentalCenterDto } from './dto/create-car_rental_center.dto';
import { UpdateCarRentalCenterDto } from './dto/update-car_rental_center.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCarDto } from 'src/car/dto/create-car.dto';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { BadRequestException } from '@nestjs/common';
@Injectable()
export class CarRentalCenterService {
  constructor(private prisma: PrismaService,
    private readonly minioService: MinioService
  ) {}
    private toRating(v?: number | null) {
    if (v == null) return null;
    const fixed = Math.round(v * 10) / 10;
    return new Prisma.Decimal(fixed);
  }

  async create(dto: CreateCarRentalCenterDto) {
    try {
      // ✅ ตรวจว่า UserService(id) มีจริง (FK: CarRentalCenter.id -> UserService.id)
      const svc = await this.prisma.userService.findUnique({
        where: { id: dto.id },
        select: { id: true, type: true },
      });
      if (!svc) throw new NotFoundException('UserService (service) not found');
      // (ถ้าต้องการบังคับ type): if (svc.type !== 'car_rental') throw new BadRequestException(...)

      return await this.prisma.carRentalCenter.create({
        data: {
          id: dto.id,                                        // = service_id
          name: dto.name,
          description: dto.description ?? undefined,
          image: dto.image ?? undefined,

          // Arrays
          pictures: dto.pictures ?? [],                      // string[]
          paymentMethods: dto.paymentMethods ?? [],
          requiredDocs: dto.requiredDocs ?? [],

          // JSON
          branches: (dto.branches as any) ?? undefined,      // Json
          contacts: (dto.contacts as any) ?? undefined,
          facilities: (dto.facilities as any) ?? undefined,
          openingHours: (dto.openingHours as any) ?? undefined,
          anotherServices: (dto.anotherServices as any) ?? undefined,
          subtopicRatings: (dto.subtopicRatings as any) ?? undefined,

          // misc
          type: dto.type ?? undefined,
          rating: this.toRating(dto.rating),                 // Decimal(3,1)
        },
        include: {
          cars: true,   // ส่งรถทั้งหมดของศูนย์กลับไปด้วย
          service: true // และข้อมูล service ต้นทาง
        },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') throw new ConflictException('id already exists');
        if (e.code === 'P2003') throw new NotFoundException('related service not found');
      }
      throw e;
    }
  }

  // (แถม) update แบบสั้น ปลอดภัย ไม่แก้ PK
  async update(id: string, dto: Partial<CreateCarRentalCenterDto>) {
    try {
      return await this.prisma.carRentalCenter.update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          description: dto.description ?? undefined,
          image: dto.image ?? undefined,
          pictures: dto.pictures ?? undefined,
          paymentMethods: dto.paymentMethods ?? undefined,
          requiredDocs: dto.requiredDocs ?? undefined,
          branches: (dto.branches as any) ?? undefined,
          contacts: (dto.contacts as any) ?? undefined,
          facilities: (dto.facilities as any) ?? undefined,
          openingHours: (dto.openingHours as any) ?? undefined,
          anotherServices: (dto.anotherServices as any) ?? undefined,
          subtopicRatings: (dto.subtopicRatings as any) ?? undefined,
          type: dto.type ?? undefined,
          rating: dto.rating != null ? this.toRating(dto.rating) : undefined,
        },
        include: { cars: true, service: true },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('CarRentalCenter not found');
      }
      throw e;
    }
  }

  findAll() {
    return this.prisma.carRentalCenter.findMany({include: { cars: true, service: {include: { reviews: true,location: true } } }});
  }

async findOne(id: string) {
    const crc = await this.prisma.carRentalCenter.findUnique({ where: { id },include: { cars: true, service: {include: { reviews: true,location: true } } } });
    if (!crc) throw new NotFoundException('Rental center not found');
    return crc;
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

  async uploadCarImages(carId: string, profileImgs: Express.Multer.File[]) {
    const car = await this.prisma.carRentalCenter.findUnique({ where: { id: carId } });
    if (!car) {
      throw new NotFoundException('Car not found');
    }
    const uploadResults: string[] = [];
    for (const file of profileImgs) {
      const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
      uploadResults.push(url);
    }
    const updatedCar = await this.prisma.carRentalCenter.update({
      where: { id: carId },
      data: {
        pictures: {
          push: uploadResults,
        },
      },
    });
    return updatedCar;
  }

  async getCarsByCenter(crcId: string) {
    const cars = await this.prisma.car.findMany({ where: { crcId } });
    return cars;  
  }

  async addAnotherService(crcId: string, service: string, price: number) {
  if (!service?.trim()) throw new BadRequestException('service required');
  if (typeof price !== 'number' || Number.isNaN(price)) {
    throw new BadRequestException('price must be a number');
  }

  const center = await this.prisma.carRentalCenter.findUnique({
    where: { id: crcId },
    select: { id: true, anotherServices: true },
  });
  if (!center) throw new NotFoundException('CarRentalCenter not found');

  // ค่าที่อ่านมาเป็น JsonValue | JsonValue[] | null -> normalize ให้เป็น array
  const prevRaw = Array.isArray(center.anotherServices)
    ? center.anotherServices
    : [];

  // ตัด null ออก เพราะ InputJsonValue[] ห้ามมี null
  const prev: Prisma.InputJsonValue[] = prevRaw
    .filter((x): x is Exclude<typeof x, null> => x !== null)
    .map((x) => x as Prisma.InputJsonValue);

  // สร้างรายการใหม่ (ห้าม push ใส่ของเก่าแล้วส่งคืน)
  const next: Prisma.InputJsonValue[] = [
    ...prev,
    { service, price } as Prisma.InputJsonValue,
  ];

  const updated = await this.prisma.carRentalCenter.update({
    where: { id: crcId },
    data: {
      // JSON/JSON[] ต้อง "set" ก้อนใหม่
      anotherServices: next,
    },
  });

  return updated;
}
}
