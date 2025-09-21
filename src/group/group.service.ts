import { Injectable } from '@nestjs/common';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common';       

@Injectable()
export class GroupService {
  constructor(private prisma: PrismaService) {}
           
           async create(dto: CreateGroupDto) {
               try {
                   return await this.prisma.group.create({
                       data: {
                          id: dto.id,
                          ownerId: dto.ownerId,
                          groupName: dto.groupName,
                          groupImg: dto.groupImg,
                          status: dto.status,
                       },
                   });
               } catch (e) {
                   if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
                       throw new ConflictException('group ID ถูกใช้งานแล้ว');
                   }
                       }
           }

  findAll() {
    return `This action returns all group`;
  }

  async findOne(id: string) {
        const location = await this.prisma.group.findUnique({ where: { id } });
            if (!location) throw new NotFoundException('Discount not found');
            return location;
      }
    
      async update(id: string, dto: UpdateGroupDto) {
        const existing = await this.prisma.group.findUnique({ where: { id } });
            if (!existing) {
                throw new NotFoundException('Location not found');
            }
            return this.prisma.group.update({
                where: { id },
                data: {
                  id: dto.id,
                  ownerId: dto.ownerId,
                  groupName: dto.groupName,
                  groupImg: dto.groupImg,
                  status: dto.status,
              },
            });
      }
    
      async remove(id: string) {
        try {
            await this.prisma.group.delete({ where: { id } });
            return { ok: true };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('group not found');
            }
            throw e;
        }
      }
}
