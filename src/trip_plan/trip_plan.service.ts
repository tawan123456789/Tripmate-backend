import { Injectable } from '@nestjs/common';
import { CreateTripPlanDto } from './dto/create-trip_plan.dto';
import { UpdateTripPlanDto } from './dto/update-trip_plan.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TripPlanService {
constructor(private prisma: PrismaService) {}
    async create(dto: CreateTripPlanDto) {
        try {
          return await this.prisma.tripPlan.create({
            data: {
              id: dto.id,
              ownerId: dto.ownerId,
              tripName: dto.tripName,
              tripImg: dto.tripImg,
              status: dto.status,
              note: dto.note,
              startDate: dto.startDate,
              endDate: dto.endDate,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('trip plan id user email already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
      }


  findAll() {
    return `This action returns all tripPlan`;
  }
async findOne(id: string) {
      const location = await this.prisma.tripPlan.findUnique({ where: { id } });
          if (!location) throw new NotFoundException('Tripplan not found');
          return location;
    }
  
    async update(id: string, dto: UpdateTripPlanDto) {
      const existing = await this.prisma.tripPlan.findUnique({ where: { id } });
          if (!existing) {
              throw new NotFoundException('Location not found');
          }
          return this.prisma.tripPlan.update({
              where: { id },
              data: {
                id: dto.id,
                ownerId: dto.ownerId,
                tripName: dto.tripName,
                tripImg: dto.tripImg,
                status: dto.status,
                note: dto.note,
                startDate: dto.startDate,
                endDate: dto.endDate,
            },
          });
    }
  
    async remove(id: string) {
      try {
          await this.prisma.tripPlan.delete({ where: { id } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('tripplan not found');
          }
          throw e;
      }
    }
}

