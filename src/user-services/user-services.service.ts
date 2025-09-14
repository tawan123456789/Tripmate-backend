import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserServicesService {
  constructor(private prisma: PrismaService) {}
  async create(dto: CreateUserServiceDto) {
      try {
        return await this.prisma.userService.create({
          data: {
            id: dto.id,
            ownerId: dto.ownerId,
            locationId: dto.locationId,
            name: dto.name,
            description: dto.description,
            serviceImg: dto.serviceImg,
            status: dto.status,
            type: dto.type,
          },
        });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
          throw new ConflictException('service ID already exists');
        }
        else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
          console.log(e);
        }
        throw e;
      }
    }

  findAll() {
    return `This action returns all userServices`;
  }

  async findOne(id: string) {
    const user = await this.prisma.userService.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async update(id: string, dto: UpdateUserServiceDto) {
    try {
          return await this.prisma.userService.update({
            where: { id },
            data: {
              ...dto,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('user-service not found');
          }
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('user-service id already exists');
          }
          throw e;
        }
  }

  async remove(id: string) {
    try {
          await this.prisma.userService.delete({ where: { id } });
          return { ok: true };
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('user-service not found');
          }
          throw e;
        }
  }
}
