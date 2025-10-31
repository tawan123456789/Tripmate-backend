import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}
  
  async makeBooking(dto: CreateBookingDto) {
    try {
      // 1️⃣ ตรวจสอบว่ามี service และ group ที่จะอ้างอิงจริงไหม
      const [service, group] = await Promise.all([
        this.prisma.userService.findUnique({ where: { id: dto.serviceId } }),
        this.prisma.group.findUnique({ where: { id: dto.groupId } }),
      ]);

      if (!service) throw new NotFoundException('Service not found');
      if (!group) throw new NotFoundException('Group not found');

      // 2️⃣ ตรวจสอบวันจองซ้ำ (ถ้าต้องการไม่ให้ซ้ำ)
      const overlapping = await this.prisma.booking.findFirst({
        where: {
          serviceId: dto.serviceId,
          AND: [
            { startBookingDate: { lte: dto.endBookingDate ?? dto.startBookingDate } },
            { endBookingDate: { gte: dto.startBookingDate } },
          ],
        },
      });
      if (overlapping) {
        throw new ConflictException('Service already booked for the selected date range');
      }

      // 3️⃣ สร้าง Booking
      const booking = await this.prisma.booking.create({
        data: {
          serviceId: dto.serviceId,
          groupId: dto.groupId,
          startBookingDate: dto.startBookingDate,
          endBookingDate: dto.endBookingDate,
          note: dto.note,
          status: dto.status ?? 'pending',
        },
        include: {
          service: true,
          group: true,
        },
      });

      return booking;
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2003') {
          throw new BadRequestException('Invalid foreign key (serviceId/groupId not found)');
        }
      }
      throw e;
    }
  }

  /**
   * ✏️ updateBooking — แก้ไขข้อมูลการจอง
   */
  async updateBooking(id: string, dto: UpdateBookingDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.booking.update({
      where: { id },
      data: {
        serviceId: dto.serviceId ?? booking.serviceId,
        groupId: dto.groupId ?? booking.groupId,
        startBookingDate: dto.startBookingDate ?? booking.startBookingDate,
        endBookingDate: dto.endBookingDate ?? booking.endBookingDate,
        note: dto.note ?? booking.note,
        status: dto.status ?? booking.status,
      },
    });
  }

  async cancelBooking(id: string) {
  const booking = await this.prisma.booking.findUnique({ where: { id } });
  if (!booking) throw new NotFoundException('Booking not found');
  if (booking.status === 'canceled') {
    throw new BadRequestException('Booking already canceled');
  }
  const updated = await this.prisma.booking.update({
    where: { id },
    data: {
      status: 'canceled',
      updatedAt: new Date(),
    },
    include: {
      service: true,
      group: true,
    },
  });

  return {
    message: 'Booking canceled successfully',
    booking: updated,
  };
}
}
