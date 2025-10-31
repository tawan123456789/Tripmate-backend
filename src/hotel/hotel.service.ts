import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateRoomDto } from '../room/dto/create-room.dto';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateHotelDto) {
      try {
        return await this.prisma.hotel.create({
          data: {
            id: dto.serviceId,
            name: dto.name,
            // type: dto.type,
            // star: dto.star,
            description: dto.description,
            image: dto.image,
            // pictures: dto.pictures,               // [] ถ้าไม่ส่ง Prisma จะใส่ default
            facility: dto.facility,
            // facilities: dto.facilities as any,    // Json
            rating: dto.rating != null ? new Prisma.Decimal(dto.rating) : null,
            // checkIn: dto.checkIn,
            // checkOut: dto.checkOut,
            // breakfast: dto.breakfast,
            // petAllow: dto.petAllow,
            // contact: dto.contact,
            // subtopicRatings: dto.subtopicRatings as any, // Json
            // locationSummary: dto.locationSummary,
            // nearbyLocations: dto.nearbyLocations, // [] by default
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
