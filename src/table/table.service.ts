import { Injectable } from '@nestjs/common';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}
    async create(dto: CreateTableDto) {
        try {
          return await this.prisma.table.create({
            data: {
              id: dto.id,
              restaurantId: dto.restaurantId,
              model: dto.model,
              description: dto.description,
              seat: dto.seat,
              pricePerSeat: dto.pricePerSeat,
              
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('table id user already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
      }
  

  findAll() {
    return `This action returns all table`;
  }

  async findOne(id: string, restaurantId: string) {
    const table = await this.prisma.table.findUnique({
      where: {
        id_restaurantId: { id, restaurantId },
      },
    });
    if (!table) throw new NotFoundException('Table not found');
    return table;
  }

  
    async update(id: string, restaurantId: string, dto: UpdateTableDto) {
      const existing = await this.prisma.table.findUnique({ where: {id_restaurantId: { id, restaurantId },} });
          if (!existing) {
              throw new NotFoundException('Location not found');
          }
          return this.prisma.table.update({
              where: {id_restaurantId: { id, restaurantId },},
              data: {
                id: dto.id,
                restaurantId: dto.restaurantId,
                model: dto.model,
                description: dto.description,
                seat: dto.seat,
                pricePerSeat: dto.pricePerSeat,
            },
          });
    }
  
    async remove(id: string, restaurantId: string,) {
      try {
          await this.prisma.table.delete({ where: {id_restaurantId: { id, restaurantId },} });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('table not found');
          }
          throw e;
      }
    }
}
