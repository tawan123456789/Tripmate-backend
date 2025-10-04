import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, ProfileUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: {
          fname: dto.fname,
          lname: dto.lname,
          username: dto.username,
          gender: dto.gender,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          role: dto.role,
          email: dto.email,
          password: dto.password,
          profileImg: dto.profileImg,
          phone: dto.phone,
          status: dto.status,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('user email already exists');
      }
      else if( e instanceof Prisma.PrismaClientKnownRequestError ) {
        console.log(e);
      }
      throw e;
    }
  }

  async findAll(params: { page?: number; pageSize?: number; q?: string } = {}) {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));
    const where: Prisma.UserWhereInput = params.q
      ? {
          OR: [
            { fname: { contains: params.q, mode: 'insensitive' } },
            { lname: { contains: params.q, mode: 'insensitive' } },
            { email: { contains: params.q, mode: 'insensitive' } },
          ],
        }
      : {};

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      data,
      meta: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    const userProfile: ProfileUserDto = {
      fname: user.fname,
      lname: user.lname,
      birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
      phone: user.phone ? user.phone : undefined,
      email: user.email,
      gender: user.gender,
      profileImg: user.profileImg ? user.profileImg : undefined,  
    };

    return userProfile;
  }

  async update(id: string, dto: UpdateUserDto) {
    try {
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...dto,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('user not found');
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('user email already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });
      return { ok: true };
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new NotFoundException('user not found');
      }
      throw e;
    }
  }

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({ where: { email: username } });
    return user;
  }

  async changePassword(id: string, dto: { oldPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new NotFoundException('old password is incorrect');
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(dto.newPassword, salt);

    return this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
     });
    }
}
