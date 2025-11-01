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
import { start } from 'repl';
import { Decimal } from '@prisma/client/runtime/library';



@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

  private servicePrice = async (serviceId: string, start: Date, end: Date, subServiceId?: string, discountId?: string, optionId?: string): Promise<number> => {
    let price = 0;
    const service = await this.prisma.userService.findUnique({ where: { id: serviceId } });
    const discount = discountId ? await this.prisma.discount.findUnique({ where: { id: discountId } }) : null;

    const diffMs = end.getTime() - start.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);
    if (service?.type === "guide") {
      const guide = await this.prisma.guide.findUnique({ where: { id: serviceId } });

      if (!guide) throw new Error(`Guide not found for serviceId ${serviceId}`);
      if (guide.hourlyRate == null) throw new Error(`Guide hourlyRate not set`);
      const rate: number = guide.hourlyRate.toNumber();
      price = rate * totalHours;
      }
    else if(service?.type == "car_rental_center"){
      const carRental = await this.prisma.carRentalCenter.findUnique({ where: { id: serviceId } });
      const car = await this.prisma.car.findFirst({
        where: {
          id: subServiceId,
          crcId: serviceId, // ต้องตรงกับ CarRentalCenter ID
        },
      });
      if(!car) throw new Error(`Car not found for subServiceId ${subServiceId}`);
      if (!carRental) throw new Error(`Car Rental Center not found for serviceId ${serviceId}`);
      if (car.pricePerDay == null) throw new Error(`Car pricePerDay not set`);
      const rate: number = car.pricePerDay.toNumber();
      const totalDays = Math.ceil(totalHours / 24);
      price = rate * totalDays;
    }
    else if(service?.type == "hotel"){
      const hotel = await this.prisma.hotel.findUnique({ where: { id: serviceId } });
      const option = await this.prisma.roomOption.findUnique({where: {id: optionId, }});
      const room = await this.prisma.room.findFirst({
        where: {
          id: subServiceId,
          hotelId: serviceId,
        },
      });
      if (!hotel) throw new Error(`Hotel not found for serviceId ${serviceId}`);
      if(!room) throw new Error(`Room not found for subServiceId ${subServiceId}`);
      if (option?.price == null) throw new Error(`Option price not set`);
      const rate: number = option.price.toNumber();
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const diffDays = Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24));
      price = rate * diffDays;
    }
    if (discount && discount.type && discount.value) {
      if (discount.type === 'percentage') {
        price = price * (1 - (discount.value?.toNumber() / 100));
      } else if (discount.type === 'fixed_amount') {
        price = price - discount.value?.toNumber();
      }
    }
    return price;
  };

  async makeBooking(dto: CreateBookingDto) {
    try {
      // 1️⃣ ตรวจสอบว่ามี service และ group ที่จะอ้างอิงจริงไหม
      const [service, group] = await Promise.all([
        this.prisma.userService.findUnique({ where: { id: dto.serviceId } }),
        this.prisma.group.findUnique({ where: { id: dto.groupId } }),
      ]);

      if (!service) throw new NotFoundException('Service not found');
      if (!group) throw new NotFoundException('Group not found');
      if (service.type !== 'guide') {
  if (!dto.subServiceId) {
    throw new BadRequestException('subServiceId is required for this service type');
  }

  let exists = false;

  switch (service.type) {
    case 'hotel': {
      // Room มีคีย์ (id, hotelId)
      const room = await this.prisma.room.findFirst({
        where: { id: dto.subServiceId, hotelId: service.id },
        select: { id: true },
      });
      exists = !!room;
      break;
    }
    case 'car_rental_center': {
      // Car มีคีย์ (id, crcId)
      const car = await this.prisma.car.findFirst({
        where: { id: dto.subServiceId, crcId: service.id },
        select: { id: true },
      });
      exists = !!car;
      break;
    }
    case 'restaurant': {
      // Table มีคีย์ (id, restaurantId)
      const table = await this.prisma.table.findFirst({
        where: { id: dto.subServiceId, restaurantId: service.id },
        select: { id: true },
      });
      exists = !!table;
      break;
    }
    default:
      // ถ้ามี service type ใหม่ ๆ ยังไม่รองรับ subService
      throw new BadRequestException(`Unsupported service type "${service.type}" for subService check`);
  }

  if (!exists) {
    throw new NotFoundException(
      `Sub-service "${dto.subServiceId}" not found under service "${service.id}" (${service.type})`
    );
  }
} else {
  // guide: ไม่มี subService → เคลียร์ทิ้งเพื่อความชัดเจน (กันค่าหลงมาสร้างเป็น null โดยตั้งใจ)
  dto.subServiceId = undefined;
}

      // 2️⃣ ตรวจสอบวันจองซ้ำ (ถ้าต้องการไม่ให้ซ้ำ)
      // กำหนดสถานะที่ถือว่า “ครองสิทธิ์ช่วงเวลา” จริง ๆ
      const ACTIVE_STATUSES = ['pending', 'booked', 'confirmed'] as const;

      const timeOverlapWhere = {
        AND: [
          { startBookingDate: { lt: dto.endBookingDate ?? dto.startBookingDate } },
          {
            OR: [
              { endBookingDate: { gt: dto.startBookingDate } },
              { endBookingDate: null }, // จองแบบไม่กำหนดปลาย → ถือว่าทับซ้อนเสมอ
            ],
          },
        ],
      };

      // --- เงื่อนไขฐาน: service + status ---
      const baseWhere: any = {
        serviceId: dto.serviceId,
        status: { in: [...ACTIVE_STATUSES] },
        ...timeOverlapWhere,
      };

      if (service.type === 'guide') {
        // ไม่ทำอะไรเพิ่ม: baseWhere เพียงพอ
      } else {
        if (!dto.subServiceId) {
          // ถ้าเป็น resource แบบย่อย (ห้อง/รถ/โต๊ะ) แต่ไม่ส่ง subServiceId มา ให้เบรคตั้งแต่ตรงนี้
          throw new BadRequestException('subServiceId is required for this service type');
        }
        baseWhere.subServiceId = dto.subServiceId;
      }

      const overlapping = await this.prisma.booking.findFirst({ where: baseWhere });
      if (overlapping) {
        throw new ConflictException('Service or sub-service already booked for the selected date range');
      }

      const booking = await this.prisma.booking.create({
        data: {
          serviceId: dto.serviceId,
          groupId: dto.groupId,
          subServiceId: dto.subServiceId,
          startBookingDate: dto.startBookingDate,
          endBookingDate: dto.endBookingDate,
          note: dto.note,
          price: await this.servicePrice(
            dto.serviceId,
            dto.startBookingDate,
            dto.endBookingDate,
            dto.subServiceId,
            dto.optionId,
            dto.discountId
          ),
          status: dto.status ?? 'booked',
        },
        include: {
          service: true,
          group: true,
        },
      });

      // 🔹 ดึงสมาชิกทั้งหมดของกลุ่ม + รวม owner เข้าไป (กันเผื่อ owner ไม่ได้อยู่ในตารางสมาชิก)
      const groupMembers = await this.prisma.userJoinGroup.findMany({
        where: { groupId: dto.groupId },
        select: { userId: true },
      });

      // รวม userIds แบบ unique
      const userIdSet = new Set<string>(groupMembers.map((m) => m.userId));
      userIdSet.add(booking.group.ownerId); // รวม owner

      const userIds = Array.from(userIdSet);

      const perShare =
       booking.price ? (booking.price as any).toNumber() / userIds.length : 0;

      // 🔹 สร้าง transactions ให้สมาชิกทุกคน (ใช้ $transaction เพื่อรันเป็น batch และได้ผลลัพธ์กลับมา)
      const transactions = await this.prisma.$transaction(
        userIds.map((uid) =>
          this.prisma.transaction.create({
            data: {
              bookingId: booking.id,
              userId: uid,
              method: dto.paymentMethod,
              amount: perShare,
            },
          }),
        ),
      );

      return { booking, transactions };
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
