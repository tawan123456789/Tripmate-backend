import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

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


}
