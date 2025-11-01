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

@Injectable()
export class PlaceService {
  constructor(private prisma: PrismaService) {}

  async create(createPlaceDto: CreatePlaceDto) {
    try {
 
      if (createPlaceDto.locationId) {
        const locationExists = await this.prisma.location.findUnique({
          where: { id: createPlaceDto.locationId },
          select: { id: true },
        });

        if (!locationExists) {
          throw new NotFoundException(
            `Location with ID "${createPlaceDto.locationId}" not found`,
          );
        }
      }

      // 🔹 สร้าง Place ใหม่
      const place = await this.prisma.place.create({
        data: {
          id: createPlaceDto.id,
          name: createPlaceDto.name,
          description: createPlaceDto.description,
          status: createPlaceDto.status ?? 'active',
          isAttraction: createPlaceDto.isAttraction ?? false,
          createdAt: createPlaceDto.createdAt, // ถ้าไม่ส่ง Prisma จะใส่ default(now())
          locationId: createPlaceDto.locationId ?? undefined,
        },
      });

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
  findAll() {
    return this.prisma.place.findMany();
  }

  findOne(id: string) {
    return this.prisma.place.findUnique({ where: { id } });
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
}
