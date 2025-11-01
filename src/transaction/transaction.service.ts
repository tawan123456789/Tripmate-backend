// transactions.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionService {
  constructor(private prisma: PrismaService) {}

  // ดึงทุกธุรกรรมของ userId และจัดกลุ่มตาม type
  async findAllGroupedByServiceType(userId: string) {
    const allTx = await this.prisma.transaction.findMany({
      where: { userId },
      include: {
        user: true,
        booking: {
          include: {
            service: {
              select: {
                id: true,
                type: true,
                hotel: { select: { id: true } },
                restaurant: { select: { id: true } },
                carRentalCenter: { select: { id: true } },
                guide: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // จัดกลุ่มตามประเภท
    const grouped = allTx.reduce((acc, tx) => {
      const type =
        tx.booking?.service?.type?.toLowerCase() ||
        (tx.booking?.service?.hotel ? 'hotel' :
         tx.booking?.service?.restaurant ? 'restaurant' :
         tx.booking?.service?.carRentalCenter ? 'car_rental' :
         tx.booking?.service?.guide ? 'guide' : 'unknown');
      acc[type] = acc[type] || [];
      acc[type].push(tx);
      return acc;
    }, {} as Record<string, typeof allTx>);

    return grouped;
  }

  // ดึงเฉพาะธุรกรรมของ user และกรองตาม service.type
  async findByServiceType(userId: string, type?: string) {
    const where: any = { userId };
    if (type) {
      where.booking = { service: { type: type.toLowerCase() } };
    }

    return this.prisma.transaction.findMany({
      where,
      include: {
        user: true,
        booking: {
          include: {
            service: {
              select: {
                id: true,
                type: true,
                hotel: { select: { id: true } },
                restaurant: { select: { id: true } },
                carRentalCenter: { select: { id: true } },
                guide: { select: { id: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
