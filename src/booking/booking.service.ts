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
import { Hotel } from 'src/hotel/entities/hotel.entity';



@Injectable()
export class BookingService {
  constructor(private prisma: PrismaService) {}

private servicePrice = async (
    serviceId: string,
    start: Date,
    end: Date,
    subServiceId?: string,
    optionId?: string,
    discountId?: string,
  ): Promise<[ price: number, discountPrice: number ]> => {
    let price = 0;
    const service = await this.prisma.userService.findUnique({ where: { id: serviceId } });
    const discount = discountId ? await this.prisma.discount.findUnique({ where: { id: discountId } }) : null;

    const diffMs = end.getTime() - start.getTime();
    const totalHours = diffMs / (1000 * 60 * 60);

    if (service?.type === 'guide') {
      const guide = await this.prisma.guide.findUnique({ where: { id: serviceId } });
      if (!guide) throw new Error(`Guide not found for serviceId ${serviceId}`);
      if (guide.hourlyRate == null) throw new Error(`Guide hourlyRate not set`);
      const rate = guide.hourlyRate.toNumber();
      price = rate * totalHours;

    } else if (service?.type === 'car_rental_center') {
      const carRental = await this.prisma.carRentalCenter.findUnique({ where: { id: serviceId } });
      const car = await this.prisma.car.findFirst({ where: { id: subServiceId, crcId: serviceId } });
      if (!car) throw new Error(`Car not found for subServiceId ${subServiceId}`);
      if (!carRental) throw new Error(`Car Rental Center not found for serviceId ${serviceId}`);
      if (car.pricePerDay == null) throw new Error(`Car pricePerDay not set`);
      const rate = car.pricePerDay.toNumber();
      const totalDays = Math.ceil(totalHours / 24);
      price = rate * totalDays;

    } else if (service?.type === 'hotel') {
      const hotel = await this.prisma.hotel.findUnique({ where: { id: serviceId } });
      const option = await this.prisma.roomOption.findUnique({ where: { id: optionId } });
      const room = await this.prisma.room.findFirst({ where: { id: subServiceId, hotelId: serviceId } });
      if (!hotel) throw new Error(`Hotel not found for serviceId ${serviceId}`);
      if (!room) throw new Error(`Room not found for subServiceId ${subServiceId}`);
      if (option?.price == null) throw new Error(`Option price not set`);
      const rate = option.price.toNumber();

      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      const diffDays = Math.floor((endDateOnly.getTime() - startDateOnly.getTime()) / (1000 * 60 * 60 * 24));
      price = rate * diffDays;
    }
    var discountPrice = 0;
    if (discount && discount.type && discount.value) {
      if (discount.type === 'percentage') {
        discountPrice = price * discount.value.toNumber() / 100
        price = price - discountPrice
       
      } 
      else if (discount.type === 'fix') {
        price = price - discount.value.toNumber();
        discountPrice = discount.value.toNumber();
      }

      if (price < 0) price = 0;
      await this.prisma.discount.update({
        where: { id: discount.id },
        data: { status: 'used' },
      });
    }

    return [price, discountPrice];
  };


 async makeBooking(dto: CreateBookingDto) {
    try {
      // 1) ตรวจของอ้างอิง
      const [service, group] = await Promise.all([
        this.prisma.userService.findUnique({ where: { id: dto.serviceId } }),
        this.prisma.group.findUnique({ where: { id: dto.groupId } }),
      ]);
      if (!service) throw new NotFoundException('Service not found');
      if (!group) throw new NotFoundException('Group not found');

      // 2) ตรวจ subService ตามประเภท
      if (service.type !== 'guide') {
        if (!dto.subServiceId) throw new BadRequestException('subServiceId is required for this service type');
        let exists = false;
        switch (service.type) {
          case 'hotel': {
            const room = await this.prisma.room.findFirst({ where: { id: dto.subServiceId, hotelId: service.id }, select: { id: true } });
            exists = !!room;
            break;
          }
          case 'car_rental_center': {
            const car = await this.prisma.car.findFirst({ where: { id: dto.subServiceId, crcId: service.id }, select: { id: true } });
            exists = !!car;
            break;
          }
          case 'restaurant': {
            const table = await this.prisma.table.findFirst({ where: { id: dto.subServiceId, restaurantId: service.id }, select: { id: true } });
            exists = !!table;
            break;
          }
          default:
            throw new BadRequestException(`Unsupported service type "${service.type}" for subService check`);
        }
        if (!exists) {
          throw new NotFoundException(`Sub-service "${dto.subServiceId}" not found under service "${service.id}" (${service.type})`);
        }
      } else {
        dto.subServiceId = undefined; // guide ไม่มี subService
      }

      // 3) ตรวจทับช่วงเวลา
      const ACTIVE_STATUSES = ['pending', 'booked', 'confirmed'] as const;
      const baseWhere: any = {
        serviceId: dto.serviceId,
        status: { in: [...ACTIVE_STATUSES] },
        AND: [
          { startBookingDate: { lt: dto.endBookingDate ?? dto.startBookingDate } },
          { OR: [{ endBookingDate: { gt: dto.startBookingDate } }, { endBookingDate: null }] },
        ],
      };
      if (service.type !== 'guide') baseWhere.subServiceId = dto.subServiceId;
      const overlapping = await this.prisma.booking.findFirst({ where: baseWhere });
      if (overlapping) throw new ConflictException('Service or sub-service already booked for the selected date range');
      const [calPrice, discountPrice] = await this.servicePrice(
            dto.serviceId,
            dto.startBookingDate,
            dto.endBookingDate,
            dto.subServiceId,
            dto.optionId,     // ✅ optionId มาก่อน
            dto.discountId,   // ✅ discountId มาทีหลัง
          )
      // 4) สร้าง booking (⛔️ ไม่สร้าง transactions ที่นี่แล้ว)
      const booking = await this.prisma.booking.create({
        data: {
          serviceId: dto.serviceId,
          groupId: dto.groupId,
          subServiceId: dto.subServiceId,
          optionId: dto.optionId,
          startBookingDate: dto.startBookingDate,
          endBookingDate: dto.endBookingDate,
          note: dto.note,
          price: calPrice,
          status: 'booked',
        },
        include: { service: true, group: true },
      });

      // ⛔️ ย้ายการสร้าง transactions ไป ConfirmBooking
      return { booking, discountPrice , calPrice};
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
        throw new BadRequestException('Invalid foreign key (serviceId/groupId not found)');
      }
      throw e;
    }
  }
  /**
   * ✏️ updateBooking — แก้ไขข้อมูลการจอง
   */
  // async updateBooking(id: string, dto: UpdateBookingDto) {
  //   const booking = await this.prisma.booking.findUnique({ where: { id } });
  //   if (!booking) throw new NotFoundException('Booking not found');

  //   return this.prisma.booking.update({
  //     where: { id },
  //     data: {
  //       serviceId: dto.serviceId ?? booking.serviceId,
  //       groupId: dto.groupId ?? booking.groupId,
  //       startBookingDate: dto.startBookingDate ?? booking.startBookingDate,
  //       endBookingDate: dto.endBookingDate ?? booking.endBookingDate,
  //       note: dto.note ?? booking.note,
  //       status: dto.status ?? booking.status,
  //     },
  //   });
  // }

  async cancelBooking(id: string) {
    const booking = await this.prisma.booking.findUnique({ where: { id } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status === 'canceled') {
      throw new BadRequestException('Booking already canceled');
    }
    if (booking.status === 'confirmed') {
      throw new BadRequestException('Booking already confirmed');
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
async ConfirmBooking(id: string) {
  // 1) หา booking
  const booking = await this.prisma.booking.findUnique({
    where: { id },
    include: { group: true },
  });
  if (!booking) throw new NotFoundException('Booking not found');
  if (booking.status === 'canceled') throw new BadRequestException('Booking already canceled');

  // 2) เช็คว่ามี tx อยู่แล้วไหม (กัน double-create)
  const hasTx = await this.prisma.transaction.findFirst({ where: { bookingId: id } });
  if (booking.status === 'confirmed' && hasTx) {
    return { message: 'Booking already confirmed (transactions exist)', booking };
  }

  // 3) หา member ทั้งหมดในกลุ่ม + owner
  const groupMembers = await this.prisma.userJoinGroup.findMany({
    where: { groupId: booking.groupId },
    select: { userId: true },
  });
  const userIdSet = new Set<string>(groupMembers.map(m => m.userId));
  if (booking.group?.ownerId) userIdSet.add(booking.group.ownerId);
  const userIds = Array.from(userIdSet);
  if (userIds.length === 0) {
    throw new BadRequestException('No members in group to share the transaction');
  }

  const total =
    (booking.price as any)?.toNumber ? (booking.price as any).toNumber() : Number(booking.price);
  const perShare = total / userIds.length;

  // ✅ ใช้ interactive transaction (overload 2) ไม่ชน type
  return await this.prisma.$transaction(async (tx) => {
    // อัปเดตสถานะเป็น confirmed (ถ้ายัง)
    const updated =
      booking.status === 'confirmed'
        ? booking
        : await tx.booking.update({
            where: { id },
            data: { status: 'confirmed', updatedAt: new Date() },
            include: { service: true, group: true },
          });

    // ถ้าเคยมี tx แล้ว ข้ามการสร้าง (idempotent)
    const existingTx = hasTx
      ? [hasTx]
      : await Promise.all(
          userIds.map((uid) =>
            tx.transaction.create({
              data: {
                bookingId: id,
                userId: uid,
                method: 'CASH', // ปรับตามโดเมนของคุณได้
                amount: perShare, // Prisma รับ number เป็น Decimal ได้
              },
            }),
          ),
        );

    return {
      message: 'Booking confirmed successfully',
      booking: updated,
      transactions: existingTx,
    };
  });
}

  async findAll() {
    return this.prisma.booking.findMany({include : {service : {include : {hotel : {include : {rooms : true}}}}}});
  }

  async findOne(bid: string) {
      const location = await this.prisma.booking.findUnique({ where: { id : bid } });
          if (!location) throw new NotFoundException('Service not found');
          return location;
    }

  async getBookingByService(service_id : string){
    return this.prisma.booking.findMany({where : {serviceId : service_id}})
  }

}
