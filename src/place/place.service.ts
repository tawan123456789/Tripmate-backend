import { Injectable } from '@nestjs/common';
import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { MinioService } from 'src/minio/minio.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PlaceService {
  constructor(private prisma: PrismaService, private minioService: MinioService) {}

  async create(createPlaceDto: CreatePlaceDto) {
    try {

      const location = await this.prisma.location.create({
                data: {
                  
                    lat: parseFloat(createPlaceDto.lat),
                    long: parseFloat(createPlaceDto.long),
                    name: createPlaceDto.name,

                },
            });

      // 🔹 สร้าง Place ใหม่
      const place = await this.prisma.place.create({
        data: {
          id: createPlaceDto.id,
          name: createPlaceDto.name,
          type: createPlaceDto.type ?? null,
          description: createPlaceDto.description ?? null,
          placeImg: createPlaceDto.placeImg ?? [],
          zone: createPlaceDto.zone ?? null,
          isAttraction: createPlaceDto.isAttraction ?? false,
          status: createPlaceDto.status ?? 'active',
          locationId: location.id,
          createdAt: createPlaceDto.createdAt ? new Date(createPlaceDto.createdAt) : undefined,
          updatedAt: createPlaceDto.updatedAt ? new Date(createPlaceDto.updatedAt) : undefined,
          deletedAt: createPlaceDto.deletedAt ? new Date(createPlaceDto.deletedAt) : undefined,
        },
      })

      return {
        message: 'Place created successfully',
        data: place,
      };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException(
            `Place with id "${createPlaceDto.id}" already exists`,
          );
        } else if (e.code === 'P2003') {
          throw new BadRequestException('Invalid foreign key (locationId)');
        }
      }
      throw e;
    }
  }
  
  findAll(req : any) {
    if(req.user.id){return this.prisma.place.findMany({include : {location:true,reviews:true,bookmark : {where : { userId: req.query.userId }}}});}
    return this.prisma.place.findMany({include : {location:true,reviews:true}});
  }

  findOne(id: string,req : any) {
    if(req.user.id){return this.prisma.place.findUnique({ where: { id } , include : {location:true,reviews:true,bookmark : {where : { userId: req.query.userId }}}});}
    return this.prisma.place.findUnique({ where: { id } , include : {location:true,reviews:true}});
  }

  update(id: string, updatePlaceDto: UpdatePlaceDto) {
    return this.prisma.place.update({
      where: { id },
      data: updatePlaceDto,
    });
  }

  remove(id: string) {
    return this.prisma.place.delete({ where: { id } });
  }


  async uploadPlaceImages(
    placeId: string,
    profileImgs: Express.Multer.File[],
  ) {
    // ตรวจสอบว่า Place มีอยู่ในฐานข้อมูลหรือไม่
    const place = await this.prisma.place.findUnique({ where: { id: placeId } });
    if (!place) {
      throw new NotFoundException(`Place with ID "${placeId}" not found`);
    }
    const uploadResults: string[] = [];
    for (const file of profileImgs) {
      const fileName = `${uuidv4()}${file.originalname.substring(file.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadImage(file.buffer, fileName, file.mimetype);
      uploadResults.push(url);
    }
    
    const updatedPlace = await this.prisma.place.update({
      where: { id: placeId },
      data: {
        placeImg: {
          push: uploadResults,
        },
      },
    });
    
    return updatedPlace;
  
  }


}
