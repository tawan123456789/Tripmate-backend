import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateRoomDto) {
        try {
          return await this.prisma.room.create({
            data: {
              id: dto.id,  // ให้ client ส่ง id มา หรือ จะให้ DB/Prisma gen เอง
              hotelId: dto.hotelId,
              name: dto.name,
              pictures: dto.pictures,
              description: dto.description,
              image: dto.image,
              bedType: dto.bedType,
              personPerRoom: dto.personPerRoom,
              sizeSqm: dto.sizeSqm,
              facilities: dto.facilities,
              pricePerNight: dto.pricePerNight != null ? new Prisma.Decimal(dto.pricePerNight) : null,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('room id already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
      }

  findAll() {
    return `This action returns all room`;
  }

  async findOne(id: string, hotel_id: string) {
      const location = await this.prisma.room.findUnique({ where: { id_hotelId: {id: id ,hotelId: hotel_id} } });
          if (!location) throw new NotFoundException('Room not found');
          return location;
    }
  

    async update(id: string, hotelId: string, dto: UpdateRoomDto) {
      try {
        return await this.prisma.room.update({
          where: { id_hotelId: { id, hotelId } },   // ✅ ใช้ composite PK
          data: {
            name: dto.name ?? undefined,
            description: dto.description ?? undefined,
            image: dto.image ?? undefined,
            bedType: dto.bedType ?? undefined,
            personPerRoom: dto.personPerRoom ?? undefined,
            sizeSqm: dto.sizeSqm ?? undefined,
            facilities: dto.facilities ?? undefined,   // string[] | undefined
            pictures: dto.pictures ?? undefined,       // string[] | undefined
            pricePerNight:
              dto.pricePerNight != null
                ? new Prisma.Decimal(dto.pricePerNight)  // number | string -> Decimal
                : undefined,                              // ไม่ส่ง = ไม่แก้
          },
        });
      } catch (e) {
        // ถ้าไม่พบ record จะได้ P2025
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
          throw new NotFoundException('Room not found');
        }
        throw e;
      }
    }

    async remove(id: string, hotelId: string) {
      try {
          await this.prisma.room.delete({ where: { id_hotelId: { id, hotelId } } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('room not found');
          }
          throw e;
      }
    }
}
