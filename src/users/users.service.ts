import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateUserDto, ProfileUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private minioService: MinioService,
  ) { }

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
      else if (e instanceof Prisma.PrismaClientKnownRequestError) {
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

  async findOne(id: string, req: any) {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) throw new NotFoundException('user not found');
    console.log('Req id:', req.user?.id);
    console.log('req role:', req.user?.role);
    console.log('Role:', u.role);
    if (req.user?.id == id) {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('user not found');
      const userProfile = {
        username: user.username,
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
    else if (u.role == 'user') {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('user not found');

      const tripCount = await this.prisma.tripPlan.count({
        where: {
          ownerId: id,
        },
      });

      // Count bookings for groups the user is a member of
      const memberships = await this.prisma.userJoinGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const groupIds = memberships.map((m) => m.groupId);
      const bookingCount = groupIds.length
        ? await this.prisma.booking.count({ where: { groupId: { in: groupIds } } })
        : 0;

      const trip = await this.prisma.tripPlan.findMany({
        where: { ownerId: id },
      });

      // mark favorite: always include boolean `favorite`; only query bookmarks if viewer exists and trips present
      const viewerId = req.user?.id;
      // default: all not favorite
      let tripsWithFavorite = trip.map((t) => ({ ...t, favorite: false }));
      if (viewerId && trip.length) {
        const tripIds = trip.map((t) => t.id);
        // bookmarks may reference the trip via `tripId` or via `serviceId` depending on how it was created
        const bookmarks = await this.prisma.bookmark.findMany({
          where: {
            userId: viewerId,
            OR: [
              { serviceId: { in: tripIds } },
              { tripId: { in: tripIds } },
            ],
          },
          select: { serviceId: true, tripId: true },
        });
        if (bookmarks.length) {
          const favSet = new Set(bookmarks.map((b) => b.tripId ?? b.serviceId));
          tripsWithFavorite = trip.map((t) => ({ ...t, favorite: favSet.has(t.id) }));
        }
      }
      const userProfile = {
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
        phone: user.phone ? user.phone : undefined,
        email: user.email,
        gender: user.gender,
        profileImg: user.profileImg ? user.profileImg : undefined,
        tripCount: tripCount,
        bookingCount: bookingCount,
        trip: tripsWithFavorite,
      };
      return userProfile;
    }

    else if (u.role == 'guide') {

      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('user not found');

      const tripCount = await this.prisma.tripPlan.count({
        where: {
          ownerId: id,
        },
      });
      const memberships = await this.prisma.userJoinGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const groupIds = memberships.map((m) => m.groupId);
      const bookingCount = groupIds.length
        ? await this.prisma.booking.count({ where: { groupId: { in: groupIds } } })
        : 0;

      const service = await this.prisma.userService.findMany({
        where: { ownerId: id },
      });

      let serviceWithFavorite = service.map((s) => ({ ...s, favorite: false }));
      if (serviceWithFavorite.length) {
        const serviceIds = service.map((s) => s.id);
        const viewerId = req.user?.id;
        const bookmarks = await this.prisma.bookmark.findMany({
          where: {
            userId: viewerId,
            serviceId: { in: serviceIds },
          },
          select: { serviceId: true },
        });
        if (bookmarks.length) {
          const favSet = new Set(bookmarks.map((b) => b.serviceId));
          serviceWithFavorite = service.map((s) => ({ ...s, favorite: favSet.has(s.id) }));
        }
      }

      const userProfile = {
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
        phone: user.phone ? user.phone : undefined,
        email: user.email,
        gender: user.gender,
        profileImg: user.profileImg ? user.profileImg : undefined,
        tripCount: tripCount,
        bookingCount: bookingCount,
        service: serviceWithFavorite,
      };
      return userProfile;
    }

    else if (u.role == 'hotel-manager') {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('user not found');

      const tripCount = await this.prisma.tripPlan.count({
        where: {
          ownerId: id,
        },
      });
      const memberships = await this.prisma.userJoinGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const groupIds = memberships.map((m) => m.groupId);
      const bookingCount = groupIds.length
        ? await this.prisma.booking.count({ where: { groupId: { in: groupIds } } })
        : 0;

      const service = await this.prisma.userService.findMany({
        where: { ownerId: id, type: 'hotel' },
      });

      let serviceWithFavorite = service.map((s) => ({ ...s, favorite: false }));
      if (serviceWithFavorite.length) {
        const serviceIds = service.map((s) => s.id);
        const viewerId = req.user?.id;
        const bookmarks = await this.prisma.bookmark.findMany({
          where: {
            userId: viewerId,
            serviceId: { in: serviceIds },
          },
          select: { serviceId: true },
        });
        if (bookmarks.length) {
          const favSet = new Set(bookmarks.map((b) => b.serviceId));
          serviceWithFavorite = service.map((s) => ({ ...s, favorite: favSet.has(s.id) }));
        }
      }

      const userProfile = {
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
        phone: user.phone ? user.phone : undefined,
        email: user.email,
        gender: user.gender,
        profileImg: user.profileImg ? user.profileImg : undefined,
        tripCount: tripCount,
        bookingCount: bookingCount,
        service: serviceWithFavorite,
      };
      return userProfile;

    }

    else if (u.role == 'car-manager') {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('user not found');

      const tripCount = await this.prisma.tripPlan.count({
        where: {
          ownerId: id,
        },
      });
      const memberships = await this.prisma.userJoinGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const groupIds = memberships.map((m) => m.groupId);
      const bookingCount = groupIds.length
        ? await this.prisma.booking.count({ where: { groupId: { in: groupIds } } })
        : 0;

      const service = await this.prisma.userService.findMany({
        where: { ownerId: id, type: 'car_rental_center' },
      });

      let serviceWithFavorite = service.map((s) => ({ ...s, favorite: false }));
      if (serviceWithFavorite.length) {
        const serviceIds = service.map((s) => s.id);
        const viewerId = req.user?.id;
        const bookmarks = await this.prisma.bookmark.findMany({
          where: {
            userId: viewerId,
            serviceId: { in: serviceIds },
          },
          select: { serviceId: true },
        });
        if (bookmarks.length) {
          const favSet = new Set(bookmarks.map((b) => b.serviceId));
          serviceWithFavorite = service.map((s) => ({ ...s, favorite: favSet.has(s.id) }));
        }
      }
      
      const userProfile = {
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
        phone: user.phone ? user.phone : undefined,
        email: user.email,
        gender: user.gender,
        profileImg: user.profileImg ? user.profileImg : undefined,
        tripCount: tripCount,
        bookingCount: bookingCount,
        service: serviceWithFavorite,
      };

      return userProfile;
    }
    else if (u.role == 'restaurant-manager') {
      const user = await this.prisma.user.findUnique({ where: { id } });
      if (!user) throw new NotFoundException('user not found');
      
      const tripCount = await this.prisma.tripPlan.count({
        where: {
          ownerId: id,
        },
      });
      const memberships = await this.prisma.userJoinGroup.findMany({
        where: { userId: id },
        select: { groupId: true },
      });
      const groupIds = memberships.map((m) => m.groupId);
      const bookingCount = groupIds.length
        ? await this.prisma.booking.count({ where: { groupId: { in: groupIds } } })
        : 0;
      
      const service = await this.prisma.userService.findMany({
        where: { ownerId: id, type: 'restaurant' },
      });

      let serviceWithFavorite = service.map((s) => ({ ...s, favorite: false }));
      if (serviceWithFavorite.length) {
        const serviceIds = service.map((s) => s.id);
        const viewerId = req.user?.id;
        const bookmarks = await this.prisma.bookmark.findMany({
          where: {
            userId: viewerId,
            serviceId: { in: serviceIds },
          },
          select: { serviceId: true },
        });
        if (bookmarks.length) {
          const favSet = new Set(bookmarks.map((b) => b.serviceId));
          serviceWithFavorite = service.map((s) => ({ ...s, favorite: favSet.has(s.id) }));
        }
      }

      const userProfile = {
        username: user.username,
        fname: user.fname,
        lname: user.lname,
        birthDate: user.birthDate ? user.birthDate.toISOString() : undefined,
        phone: user.phone ? user.phone : undefined,
        email: user.email,
        gender: user.gender,
        profileImg: user.profileImg ? user.profileImg : undefined,
        tripCount: tripCount,
        bookingCount: bookingCount,
        service: serviceWithFavorite,
      };
      return userProfile;
    }


    throw new NotFoundException('user role not found');

  }

  async update(id: string, dto: UpdateUserDto, profileImg?: Express.Multer.File) {
    try {
      let profileImgUrl = dto.profileImg;
      if (profileImg) {
        const fileName = `${uuidv4()}${profileImg.originalname.substring(profileImg.originalname.lastIndexOf('.'))}`;
        const url = await this.minioService.uploadAvatar(profileImg.buffer, fileName, profileImg.mimetype);
        profileImgUrl = url;
      }
      return await this.prisma.user.update({
        where: { id },
        data: {
          ...dto,
          birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
          profileImg: profileImgUrl,
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
    // Allow lookup by email or username for flexibility
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: username }, { username: username }] } });
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
