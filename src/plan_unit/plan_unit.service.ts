import { Injectable } from '@nestjs/common';
import { CreatePlanUnitDto } from './dto/create-plan_unit.dto';
import { UpdatePlanUnitDto } from './dto/update-plan_unit.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class PlanUnitService {
constructor(private prisma: PrismaService) {}
    async create(dto: CreatePlanUnitDto) {
        try {
          return await this.prisma.tripUnit.create({
            data: {
              id: dto.id,
              tripId: dto.tripId,
              placeId: dto.placeId,
              timeStampStart: dto.timeStampStart,
              duration: dto.duration,
              status: dto.status,
              note: dto.note,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('trip unit id user email already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
      }

  findAll() {
    return `This action returns all trip unit`;
  }

async findOne(id: string) {
      const location = await this.prisma.tripUnit.findUnique({ where: { id } });
          if (!location) throw new NotFoundException('Location not found');
          return location;
    }
  
    async update(id: string, dto: UpdatePlanUnitDto) {
      const existing = await this.prisma.tripUnit.findUnique({ where: { id } });
          if (!existing) {
              throw new NotFoundException('Location not found');
          }
          return this.prisma.tripUnit.update({
              where: { id },
              data: {
                id: dto.id,
                tripId: dto.tripId,
                placeId: dto.placeId,
                timeStampStart: dto.timeStampStart,
                duration: dto.duration,
                status: dto.status,
                note: dto.note,
            },
          });
    }
  
    async remove(id: string) {
      try {
          await this.prisma.tripUnit.delete({ where: { id } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('trip unit not found');
          }
          throw e;
      }
    }
}
