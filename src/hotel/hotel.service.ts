import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { CreateRoomDto } from 'src/room/dto/create-room.dto';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  private toDecimalOrNull(v?: number | null) {
    if (v === null || v === undefined) return null;
    // ตัดทศนิยมตามสเปค Decimal(3,1) เผื่อส่ง 9.99 เข้ามา
    const fixed = Math.round(v * 10) / 10;
    return new Prisma.Decimal(fixed);
  }

  async create(dto: CreateHotelDto) {
    try {
      // (ทางเลือก) ตรวจว่ามี service ต้นทางจริงไหม ถ้าต้องการบังคับความถูกต้อง:
      const service = await this.prisma.userService.findUnique({
        where: { id: dto.serviceId },
        select: { id: true },
      });
      if (!service) {
        throw new NotFoundException('Service not found');
      }

      return await this.prisma.hotel.create({
        data: {
          id: dto.serviceId,                 // ใช้ serviceId เป็น id โรงแรม
          name: dto.name,

          // optional primitives
          type: dto.type ?? undefined,
          star: dto.star ?? undefined,
          description: dto.description ?? undefined,
          image: dto.image ?? undefined,

          // arrays — ถ้าไม่ส่ง ปล่อย undefined เพื่อให้ Prisma ใช้ค่า default ใน schema
          pictures: dto.pictures ?? undefined,
          nearbyLocations: dto.nearbyLocations ?? undefined,

          // legacy string
          facility: dto.facility ?? undefined,

          // JSON fields
          facilities: dto.facilities as any,          // Prisma.JsonValue
          subtopicRatings: dto.subtopicRatings as any,

          // Decimal(3,1)
          rating: this.toDecimalOrNull(dto.rating),

          // policy / misc
          checkIn: dto.checkIn ?? undefined,
          checkOut: dto.checkOut ?? undefined,
          breakfast: dto.breakfast ?? undefined,
          petAllow:
            typeof dto.petAllow === 'boolean' ? dto.petAllow : undefined,
          contact: dto.contact ?? undefined,
          locationSummary: dto.locationSummary ?? undefined,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      ) {
        // unique key ซ้ำ (เช่น id ซ้ำ)
        throw new ConflictException('hotel id already exists');
      }
      throw e;
    }
  }
  

  findAll() {
    return this.prisma.hotel.findMany();
  }

  async findOne(id: string) {
    const location = await this.prisma.hotel.findUnique({ where: { id } });
        if (!location) throw new NotFoundException('Hotel not found');
        return location;
  }

  // async update(id: string, dto: UpdateHotelDto) {
  //   const existing = await this.prisma.hotel.findUnique({ where: { id } });
  //       if (!existing) {
  //           throw new NotFoundException('Hotel not found');
  //       }
  //       return this.prisma.hotel.update({
  //           where: { id },
  //           data: {
  //             id: dto.id,
  //             name: dto.name,
  //             description: dto.description,
  //             facility: dto.facility,
  //             image: dto.image,
  //         },
  //       });
  // }

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
    async addRoom(dto : CreateRoomDto) {
      try {
        return await this.prisma.room.create({
          data: {
            ...dto,
            // ให้ DB/Prisma gen เอง
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException('room already exists');
        }
        throw e;
      }
    }

  
}
