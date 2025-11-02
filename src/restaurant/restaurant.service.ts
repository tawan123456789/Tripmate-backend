import { Injectable } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class RestaurantService {
constructor(private prisma: PrismaService) {}
    async create(dto: CreateRestaurantDto) {
        try {
          return await this.prisma.restaurant.create({
            data: {
              id: dto.id,
              name: dto.name,
              description: dto.description,
              menu: dto.menu,
              image: dto.image,
              
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('restaurant id user email already exists');
          }
          else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
            console.log(e);
          }
          throw e;
        }
      }

  findAll(req: any) {
    if(req.user.id){return this.prisma.restaurant.findMany({include: { service: { include: { reviews: true, location: true, bookmarks: {where : { userId: req.user.id} } } } }});}
    else{return this.prisma.restaurant.findMany({include: { service: { include: { reviews: true, location: true } } }});}
    
  }

async findOne(id: string, req: any) {
      if(req.user.id){ const location = await this.prisma.restaurant.findUnique({ where: { id }, include: { service: { include: { reviews: true, location: true, bookmarks: {where : { userId: req.user.id } } } } } });
          if (!location) throw new NotFoundException('Location not found');
          return location;}
      else{
        const location = await this.prisma.restaurant.findUnique({ where: { id }, include: { service: { include: { reviews: true, location: true } } } });
          if (!location) throw new NotFoundException('Location not found');
          return location;
      }
   
    }
  
    async update(id: string, dto: UpdateRestaurantDto) {
      const existing = await this.prisma.restaurant.findUnique({ where: { id } });8
          if (!existing) {
              throw new NotFoundException('Location not found');
          }
          return this.prisma.restaurant.update({
              where: { id },
              data: {
                id: dto.id,
                name: dto.name,
                description: dto.description,
                menu: dto.menu,
                image: dto.image,
            },
          });
    }
  
    async remove(id: string) {
      try {
          await this.prisma.restaurant.delete({ where: { id } });
          return { ok: true };
      } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
              throw new NotFoundException('restaurant not found');
          }
          throw e;
      }
    }
}
