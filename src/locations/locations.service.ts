import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { NearbyLocationDto } from './dto/nearby-location.dto';

@Injectable()
export class LocationsService {
    constructor(private prisma: PrismaService) {}
    
    async create(dto: CreateLocationDto) {
        try {
            return await this.prisma.location.create({
                data: {
                    id: dto.id,
                    lat: parseFloat(dto.lat),
                    long: parseFloat(dto.long),
                    name: dto.name,
                    detail: dto.detail,
                    status: dto.status,
                    zone: dto.zone,
                    country: dto.country,
                    province: dto.province,
                    district: dto.district,
                    street: dto.street,
                    address: dto.address,
                    zipCode: dto.zipCode,
                },
            });
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                throw new ConflictException('Location ID ถูกใช้งานแล้ว');
            }
                }
    }
    
    async update(id: string, dto: UpdateLocationDto) {
        const existing = await this.prisma.location.findUnique({ where: { id } });
        if (!existing) {
            throw new NotFoundException('Location not found');
        }
        return this.prisma.location.update({
            where: { id },
            data: {
                lat: dto.lat ? parseFloat(dto.lat) : undefined,
                long: dto.long ? parseFloat(dto.long) : undefined,
                name: dto.name,
                detail: dto.detail,
                status: dto.status,
                zone: dto.zone,
                country: dto.country,
                province: dto.province,
                district: dto.district,
                street: dto.street,
                address: dto.address,
                zipCode: dto.zipCode,
            },
        });
    }

    async findOne(id: string) {
        const location = await this.prisma.location.findUnique({ where: { id } });
        if (!location) throw new NotFoundException('Location not found');
        return location;
    }

    async remove(id: string) {
        try {
            await this.prisma.location.delete({ where: { id } });
            return { ok: true };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('Location not found');
            }
            throw e;
        }
    }

 async findNearby(dto: NearbyLocationDto) {
  const { lat, lng, radiusKm = 5, limit = 50 } = dto;

  const latDelta = radiusKm / 111.32;
  const cosLat = Math.cos(lat * Math.PI / 180);
  const safeCos = Math.max(0.000001, Math.abs(cosLat));
  const lngDelta = radiusKm / (111.32 * safeCos);

  return this.prisma.$queryRaw<
    Array<{ location_id: string; name: string; lat: number; long: number; distance_km: number; }>
  >`
    SELECT 
      l."location_id",
      l."name",
      l."lat",
      l."long",
      6371 * ACOS(
        LEAST(1, GREATEST(-1,
          COS(RADIANS(${lat})) * COS(RADIANS(l."lat")) *
          COS(RADIANS(l."long") - RADIANS(${lng})) +
          SIN(RADIANS(${lat})) * SIN(RADIANS(l."lat"))
        ))
      ) AS distance_km
    FROM "Location" l
    WHERE 
      l."deleted_at" IS NULL
      AND l."lat"  BETWEEN ${lat - latDelta} AND ${lat + latDelta}
      AND l."long" BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}
      AND 6371 * ACOS(
        LEAST(1, GREATEST(-1,
          COS(RADIANS(${lat})) * COS(RADIANS(l."lat")) *
          COS(RADIANS(l."long") - RADIANS(${lng})) +
          SIN(RADIANS(${lat})) * SIN(RADIANS(l."lat"))
        ))
      ) <= ${radiusKm}
    ORDER BY distance_km ASC
    LIMIT ${limit};
  `;
}
}
