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
  

  // async update(id: string, hotel_id: string, dto: UpdateRoomDto) {
  //   const existing = await this.prisma.room.findUnique({ where: { id_hotelId: {id: id ,hotelId: hotel_id} } });
  //       if (!existing) {
  //           throw new NotFoundException('Room not found');
  //       }
  //       return this.prisma.room.update({
  //           where: { id_hotelId: {id: id ,hotelId: hotel_id} },
  //           data: {
  //             id: dto.id,
  //             hotelId: dto.hotelId,
  //             pricePerNight: dto.pricePerNight,
  //             bedType: dto.bedType,
  //             personPerRoom: dto.personPerRoom,
  //             description: dto.description,
  //             image: dto.image,
  //         },
  //       });
  //   }
  
    async remove(id: string, hotel_id: string) {
      try {
          await this.prisma.room.delete({ where: { id_hotelId: {id: id,hotelId: hotel_id} } });
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
