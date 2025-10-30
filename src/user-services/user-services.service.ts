import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { CreateHotelDto } from 'src/hotel/dto/create-hotel.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';

@Injectable()
export class UserServicesService {
  constructor(private prisma: PrismaService) {}

  async createHotelService(dto: CreateUserServiceDto, createHotelDto: CreateHotelDto) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) สร้าง UserService พื้นฐาน
        const service = await tx.userService.create({
          data: {
            // ถ้า schema มี @default(uuid()) ที่ id สามารถละ field id ได้
            id: dto.id,
            ownerId: dto.ownerId,
            locationId: dto.locationId,
            name: dto.name,
            description: dto.description,
            serviceImg: dto.serviceImg,
            status: dto.status,
            type: 'hotel', // บังคับให้ชัด
          },
        });

        // 2) สร้าง Hotel โดยอ้างอิง service ที่เพิ่งสร้าง
        //    เคส A: มีฟิลด์ FK ชื่อ serviceId ใน model Hotel

        // ถ้า schema ของคุณไม่ได้ใช้ field serviceId แต่ใช้ relation object (เช่นชื่อ relation 'service')
        // ให้ใช้โค้ดด้านล่างแทน (ลบบล็อกด้านบนออก):
        
        const hotel = await tx.hotel.create({
          data: {
            name: createHotelDto.name ?? dto.name,
            type: createHotelDto.type ?? 'hotel',
            star: createHotelDto.star,
            description: createHotelDto.description,
            image: createHotelDto.image,
            pictures: createHotelDto.pictures,
            facility: createHotelDto.facility,
            facilities: createHotelDto.facilities as any,
            rating: createHotelDto.rating as any,
            checkIn: createHotelDto.checkIn,
            checkOut: createHotelDto.checkOut,
            breakfast: createHotelDto.breakfast,
            petAllow: createHotelDto.petAllow,
            contact: createHotelDto.contact,
            subtopicRatings: createHotelDto.subtopicRatings as any,
            locationSummary: createHotelDto.locationSummary,
            nearbyLocations: createHotelDto.nearbyLocations,
            // เชื่อม relation ด้วย connect แทนการเซ็ต FK ตรง ๆ
            service: { connect: { id: service.id } },
          },
        });
        return { service, hotel };
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('service ID already exists');
        }
        if (e.code === 'P2003') {
          // FK ผิด/ไม่เจอ service.id (เช่น schema ไม่ตรง field ที่ใส่)
          throw new BadRequestException(`Foreign key constraint failed (${e.meta?.constraint ?? 'unknown constraint'})`);
        }
        if (e.code === 'P2023') {
          // UUID ผิดรูปแบบ (ถ้าคอลัมน์เป็น @db.Uuid)
          throw new BadRequestException('Invalid UUID in id/ownerId/locationId/serviceId');
        }
      }
      throw e;
    }
  }
  

  findAll() {
    return `This action returns all userServices`;
  }

  async findOne(id: string) {
    const user = await this.prisma.userService.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async update(id: string, dto: UpdateUserServiceDto) {
    try {
          return await this.prisma.userService.update({
            where: { id },
            data: {
              ...dto,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('user-service not found');
          }
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('user-service id already exists');
          }
          throw e;
        }
  }

  async remove(id: string) {
    try {
          await this.prisma.userService.delete({ where: { id } });
          return { ok: true };
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('user-service not found');
          }
          throw e;
        }
  }

  async removeByOwner(ownerId: string) {
    try {
          await this.prisma.userService.deleteMany({ where: { ownerId } });
          return { ok: true };
        } catch (e) {
          throw e;
        }
  }
  async findByOwner(ownerId: string) {
    return this.prisma.userService.findMany({ where: { ownerId } });
  }


}
