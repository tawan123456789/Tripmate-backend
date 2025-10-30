import { Injectable } from '@nestjs/common';
import { CreateUserJoinGroupDto } from './dto/create-user_join_group.dto';
import { UpdateUserJoinGroupDto } from './dto/update-user_join_group.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ConflictException } from '@nestjs/common/exceptions';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';


@Injectable()
export class UserJoinGroupService {
  constructor(private prisma: PrismaService) {}
    async create(dto: CreateUserJoinGroupDto) {
          try {
            return await this.prisma.userJoinGroup.create({
              data: {
                userId: dto.userId,
                groupId: dto.groupId,
                status: dto.status,
                joinDate: dto.joinDate,
              },
            });
          } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
              throw new ConflictException('user-group id already exists');
            }
            else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
              console.log(e);
            }
            throw e;
          }
        }
  
    findAll() {
      return `This action returns all userJoinGroup`;
    }
  
    async findOne(user_id: string, group_id: string) {
        const location = await this.prisma.userJoinGroup.findUnique({ where: { groupId_userId: {userId: user_id ,groupId: group_id} } });
            if (!location) throw new NotFoundException('user-group not found');
            return location;
    }
    
  
    async update(user_id: string, group_id: string, dto: UpdateUserJoinGroupDto) {
      const existing = await this.prisma.userJoinGroup.findUnique({ where: { groupId_userId: {userId: user_id ,groupId: group_id} } });
          if (!existing) {
              throw new NotFoundException('user-group not found');
          }
          return this.prisma.userJoinGroup.update({
              where: { groupId_userId: {userId: user_id ,groupId: group_id} },
              data: {
                userId: dto.userId,
                groupId: dto.groupId,
                status: dto.status,
                joinDate: dto.joinDate,
            },
          });
      }
    
      async remove(user_id: string, group_id: string) {
        try {
            await this.prisma.userJoinGroup.delete({ where: { groupId_userId: {userId: user_id ,groupId: group_id} } });
            return { ok: true };
        } catch (e) {
            if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
                throw new NotFoundException('user-group not found');
            }
            throw e;
        }
      }
}
