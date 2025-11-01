import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { BadRequestException } from '@nestjs/common';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService, private minioService: MinioService) {}

  private toDecimalOrNull(v?: number | null) {
    if (v === null || v === undefined) return null;
    // ตัดทศนิยมตามสเปค Decimal(3,1) เผื่อส่ง 9.99 เข้ามา
    const fixed = Math.round(v * 10) / 10;
    return new Prisma.Decimal(fixed);
  }

    private toDecimalOrUndefined(v?: number | null) {
    if (v == null) return undefined;
    const fixed = Math.round(v * 10) / 10;
    return new Prisma.Decimal(fixed);
  }

  async create(dto: CreateHotelDto) {
    try {
      // ✅ ตรวจว่ามี service ต้นทางจริง (Hotel.id = service.id)
      const service = await this.prisma.userService.findUnique({
        where: { id: dto.serviceId },
        select: { id: true },
      });
      if (!service) throw new NotFoundException('Service not found');

      return await this.prisma.hotel.create({
        data: {
          id: dto.serviceId,                   // ใช้ serviceId เป็น PK ของ Hotel
          name: dto.name,
          type: dto.type ?? undefined,
          star: dto.star ?? undefined,
          description: dto.description ?? undefined,

          // Arrays: ส่ง undefined เพื่อให้ Prisma ใช้ default ที่สคีมา (ถ้ามี)
          pictures: dto.pictures ?? undefined,
          nearbyLocations: dto.nearbyLocations ?? undefined,

          // JSON fields
          facilities: (dto.facilities as any) ?? undefined,
          subtopicRatings: (dto.subtopicRatings as any) ?? undefined,

          // Decimal(3,1)
          rating: this.toDecimalOrNull(dto.rating),

          // misc/policy
          checkIn: dto.checkIn ?? undefined,
          checkOut: dto.checkOut ?? undefined,
          breakfast: dto.breakfast ?? undefined,
          petAllow: typeof dto.petAllow === 'boolean' ? dto.petAllow : undefined,
          contact: dto.contact ?? undefined,
          locationSummary: dto.locationSummary ?? undefined,
        },
        include: {
          rooms: { include: { options: true } },
          service: { include: { reviews: true } },
        },
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('hotel id already exists');
      }
      throw e;
    }
  }
  
  async update(id: string, dto: UpdateHotelDto) {
    // ป้องกันการพยายามแก้ PK ผ่าน dto.serviceId
    if ((dto as any).serviceId && (dto as any).serviceId !== id) {
      throw new BadRequestException('serviceId cannot be changed');
    }

    // เช็คว่ามี hotel จริง
    const existing = await this.prisma.hotel.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Hotel not found');

    return this.prisma.hotel.update({
      where: { id },
      data: {
        // primitives
        name: dto.name ?? undefined,
        type: dto.type ?? undefined,
        star: dto.star ?? undefined,
        description: dto.description ?? undefined,
        checkIn: dto.checkIn ?? undefined,
        checkOut: dto.checkOut ?? undefined,
        breakfast: dto.breakfast ?? undefined,
        petAllow: typeof dto.petAllow === 'boolean' ? dto.petAllow : undefined,
        contact: dto.contact ?? undefined,
        locationSummary: dto.locationSummary ?? undefined,

        // arrays (แทนที่ทั้งอาเรย์ถ้าส่งมา)
        pictures: Array.isArray(dto.pictures) ? { set: dto.pictures } : undefined,
        nearbyLocations: Array.isArray(dto.nearbyLocations) ? { set: dto.nearbyLocations } : undefined,

        // JSON
        facilities: dto.facilities as any ?? undefined,
        subtopicRatings: dto.subtopicRatings as any ?? undefined,

        // Decimal
        rating: this.toDecimalOrUndefined(dto.rating),
      },
      include: {
        rooms: { include: { options: true } },
        service: { include: { reviews: true } },
      },
    });
  }
  

  findAll() {
    return this.prisma.hotel.findMany({include: { rooms: { include: { options: true } } , service: { include: { reviews: true ,location: true } } }});
  }

  async findOne(id: string) {
    const location = await this.prisma.hotel.findUnique({ where: { id }, include: { rooms: { include: { options: true } }, service: { include: { reviews: true ,location: true } } } });
        if (!location) throw new NotFoundException('Hotel not found');
        return location;
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
  async addRoom(dto: CreateRoomDto) {
    try {
      const {
        id,
        hotelId,
        name,
        pictures,
        description,
        facilities,
        sizeSqm,
        options,
      } = dto;

      return await this.prisma.room.create({
        data: {
          // ✅ composite PK (id, hotelId)
          id,
          hotelId,

          // ✅ คุมฟิลด์ทีละตัว (ไม่ใช้ spread dto)
          name: name ?? undefined,
          pictures: pictures ?? [],        // default []
          description: description ?? undefined,
          facilities: facilities ?? [],    // default []
          sizeSqm: sizeSqm ?? undefined,

          // ✅ nested create RoomOption[]
          options: options && options.length
            ? {
                create: options.map((o) => ({
                  name: o.name,
                  bed: o.bed ?? undefined,
                  maxGuest: o.maxGuest ?? undefined,
                  price:
                    o.price != null
                      ? new Prisma.Decimal(o.price) // number -> Decimal(10,2)
                      : undefined,
                })),
              }
            : undefined,
        },
        include: {
          options: true, // ส่ง options กลับไปด้วย
        },
      });
    } catch (e: any) {
      // PK/unique ซ้ำ (id+hotelId หรือ unique อื่น ๆ)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('room already exists');
      }
      // FK ผิด (hotelId ไม่มีอยู่)
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new NotFoundException('hotel not found');
      }
      throw e;
    }
}

    async uploadHotelImages(hotelId: string, files: Express.Multer.File[]) {
      const hotel = await this.prisma.hotel.findUnique({ where: { id: hotelId } });
      if (!hotel) {
        throw new NotFoundException('Hotel not found');
      }

    const uploadResults: string[] = [];
    for (const file of files) {
      const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
      uploadResults.push(url);
    }

    const updatedHotel = await this.prisma.hotel.update({
      where: { id: hotelId },
      data: {
        pictures: {
          push: uploadResults,
        },
      },
    });

    return updatedHotel;
  }
} 