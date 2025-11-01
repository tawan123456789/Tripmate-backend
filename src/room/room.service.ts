import { Injectable } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class RoomService {
  constructor(private prisma: PrismaService, private minioService: MinioService) {}
  async create(dto: CreateRoomDto) {
        try {
          return await this.prisma.room.create({
            data: {
              id: dto.id,  // ให้ client ส่ง id มา หรือ จะให้ DB/Prisma gen เอง
              hotelId: dto.hotelId,
              name: dto.name,
              pictures: dto.pictures,
              description: dto.description,
              sizeSqm: dto.sizeSqm,
              facilities: dto.facilities,
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

            sizeSqm: dto.sizeSqm ?? undefined,
            facilities: dto.facilities ?? undefined,   // string[] | undefined
            pictures: dto.pictures ?? undefined,       // string[] | undefined
                                         // ไม่ส่ง = ไม่แก้
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

    async uploadRoomImages(
      roomId: string,
      hotelId: string,
      files: Express.Multer.File[],
    ) {
      const room = await this.prisma.room.findUnique({ where: { id_hotelId: { id: roomId, hotelId: hotelId } } });
      if (!room) {
        throw new NotFoundException('Room not found');
      }
      const uploadResults: string[] = [];
      for (const file of files) {
        const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
        const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
        uploadResults.push(url);
      }
      const updatedRoom = await this.prisma.room.update({
        where: { id_hotelId: { id: roomId, hotelId: hotelId } },
        data: {
          pictures: {
            push: uploadResults,
          },
        },
      });
      return updatedRoom;
    }
  }
