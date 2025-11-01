import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomAlphanumeric } from '../utils/random.util';
import { CreateTripPlanDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { FrontTripEventDto } from './dto/front-trip.dto';
import { FrontCreateTripPayloadDto } from './dto/front-trip.dto';
import { Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// helper: random id
const rid = (length: number) => randomAlphanumeric(length);

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) { }

  async create(createTripDto: CreateTripPlanDto) {
    // basic validation
    if (!createTripDto.ownerId) {
      throw new BadRequestException('ownerId is required');
    }

    const tripId = `${randomAlphanumeric(6)}`;
    if (!createTripDto.status) {
      createTripDto.status = 'private';
    }

    // prepare trip data
    const tripData: any = {
      id: tripId,
      ownerId: createTripDto.ownerId,
      tripName: createTripDto.tripName,
      tripImg: createTripDto.tripImg,
      status: createTripDto.status,
      note: createTripDto.note,
      startDate: createTripDto.startDate ? new Date(createTripDto.startDate) : undefined,
      endDate: createTripDto.endDate ? new Date(createTripDto.endDate) : undefined,
    };

    // create trip plan
    const trip = await this.prisma.tripPlan.create({ data: tripData });



    // collect trip units from days/events
    const units: Array<any> = [];
    // collect trip services (accommodation/guide entries)
    const tripServices: Array<any> = [];
    if (Array.isArray(createTripDto.days)) {
      for (const day of createTripDto.days) {
        // if accommodationId or guideId provided, create TripService entries
        if (day.accommodationId) {
          tripServices.push({
            id: `ts_${randomAlphanumeric(10)}`,
            tripId: tripId,
            serviceId: day.accommodationId,
            date: day.date ? new Date(day.date) : undefined,
            status: 'accommodation',
          });
        }
        if (day.guideId) {
          tripServices.push({
            id: `ts_${randomAlphanumeric(10)}`,
            tripId: tripId,
            serviceId: day.guideId,
            date: day.date ? new Date(day.date) : undefined,
            status: 'guide',
          });
        }
        if (!Array.isArray(day.events)) continue;
        for (const ev of day.events) {
          // only create a TripUnit when placeId is provided (model requires placeId)
          if (!ev.placeId) continue;
          // create unit for visit events (TripEventType.VISIT)
          if (ev.type == "place") {
            units.push({
              id: `ut_${randomAlphanumeric(10)}`,
              tripId: tripId,
              serviceId: null,
              placeId: ev.placeId,
              timeStampStart: new Date(ev.startAt),
              duration: ev.durationMinutes,
              status: ev.status,
              note: ev.note,
            })
          }
          else if (ev.type == "service") {
            units.push({
              id: `ut_${randomAlphanumeric(10)}`,
              tripId: tripId,
              serviceId: ev.placeId,
              placeId: null,
              timeStampStart: new Date(ev.startAt),
              duration: ev.durationMinutes,
              status: ev.status,
              note: ev.note,
            });

          }
        }
      }
    }

    if (units.length > 0) {
      // createMany for performance
      await this.prisma.tripUnit.createMany({ data: units });
    }

    // create tripServices entries if any
    if (tripServices.length > 0) {
      // use createMany; Prisma will ignore duplicates if any
      await this.prisma.tripService.createMany({ data: tripServices });
    }

    // return created trip with units
    return this.prisma.tripPlan.findUnique({
      where: { id: tripId },
      include: { units: true, tripServices: true },
    });
  }

  findAll() {
    return `This action returns all trip`;
  }

  async findOne(id: string) {
    const trip = await this.prisma.tripPlan.findUnique({ where: { id }, include: { units: true, tripServices: true } });
    if (!trip) {
      throw new BadRequestException('Trip not found');
    }

    if (trip.status === 'private') {
      throw new BadRequestException('Trip is private');
    }



    return trip;
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }

  async publicTrip() {
    const trips = await this.prisma.tripPlan.findMany({
      where: { status: 'public' }
    });
    return trips;
  }

  async createFromFrontPayload(payload: FrontCreateTripPayloadDto & { ownerId: string }) {
    if (!payload.ownerId) throw new BadRequestException('ownerId is required');
    if (!payload.title) throw new BadRequestException('title is required');
    if (!payload.startDate) throw new BadRequestException('startDate is required');

    const tripId = rid(6);
    const status = payload.isPublic ? 'public' : 'private';
    const start = new Date(payload.startDate);
    const end = payload.endDate ? new Date(payload.endDate) : undefined;
    if (end && end < start) {
      throw new BadRequestException('endDate must be >= startDate');
    }

    await this.prisma.$transaction(async (tx) => {
      // 1) TripPlan
      await tx.tripPlan.create({
        data: {
          id: tripId,
          ownerId: payload.ownerId,
          tripName: payload.title,
          status,
          startDate: start,
          endDate: end,
        },
      });

      // helpers
      const addDays = (d: Date, days: number) => {
        const x = new Date(d);
        x.setUTCDate(x.getUTCDate() + days);
        return x;
      };
      const parseTimeInto = (baseDate: Date, hhmm: string) => {
        const [hh, mm] = (hhmm ?? '00.00').split('.');
        const out = new Date(baseDate);
        out.setUTCHours(parseInt(hh || '0', 10), parseInt(mm || '0', 10), 0, 0);
        return out;
      };

      // สร้าง/เชื่อม Location → Place แล้วคืน placeId
      const ensurePlace = async (ev: FrontTripEventDto) => {
        const title = ev.title ?? ev.location?.label ?? 'Untitled';
        const desc = ev.desc ?? null;

        // ถ้ามีพิกัด: สร้าง Location และ Place
        if (ev.location?.lat != null && ev.location?.lng != null) {
          const lat = ev.location.lat;
          const long = ev.location.lng;
          const name = ev.location.label ?? ev.title ?? 'Unknown Location';

          const place = await tx.place.create({
            data: {
              id: `pl_${rid(8)}`,
              name: title,
              description: desc,
              location: {
                create: {
                  id: `loc_${rid(8)}`,
                  lat,
                  long,
                  name,
                },
              },
            },
            select: { id: true },
          });

          return place.id;
        }

        // ไม่มีพิกัด → สร้าง Place อย่างเดียว
        const p = await tx.place.create({
          data: {
            id: `pl_${rid(8)}`,
            name: title,
            description: desc,
          },
          select: { id: true },
        });
        return p.id;
      };

      // 2) เดินตามวัน: TripService + TripUnit
      for (const day of payload.days ?? []) {
        if (day.dateOffset == null || day.dateOffset < 0) {
          throw new BadRequestException('dateOffset is required and must be >= 0');
        }
        const baseDate = addDays(start, day.dateOffset);

        // 2.1) services[] → TripService (เฉพาะที่ userService มีอยู่จริง เพื่อกัน FK ล้ม)
        // 2.1) services[] → TripService (เฉพาะที่ userService มีอยู่จริง เพื่อกัน FK ล้ม)
        for (const s of day.services ?? []) {
          const svc = await tx.userService.findUnique({
            where: { id: s.id },
            select: { id: true },
          });
          if (!svc) continue; // ข้ามถ้าไม่มีจริง

          // เตรียม meta
          const meta: Record<string, any> = {};
          if (s.roomId) meta.roomId = s.roomId;
          if (s.packageId) meta.packageId = s.packageId;
          if (typeof s.quantity === 'number') meta.quantity = s.quantity;

          await tx.tripService.create({
            data: {
              id: `ts_${rid(10)}`,
              tripId,
              serviceId: s.id,
              date: baseDate,      // map -> date_time
              status: s.type,      // 'hotel' | 'guide' | 'car'
              meta: Object.keys(meta).length ? meta : undefined, // 👈 เก็บลง JSON
            },
          });
        }


        // 2.2) events[] → TripUnit (แนบ Place + เวลาเริ่ม)
        for (const ev of day.events ?? []) {
          const startAt = parseTimeInto(baseDate, ev.time);
          const placeId = await ensurePlace(ev);

          await tx.tripUnit.create({
            data: {
              id: `ut_${rid(10)}`,
              tripId,
              placeId,
              serviceId: null, // ถ้าจะชี้ Booking ค่อยเติมในอนาคต
              timeStampStart: startAt,
              duration: 60, // default 60 นาที
              status: 'visit',
              note: ev.desc ?? null,
            },
          });
        }
      }
    });

    // ตอบกลับ id อย่างเดียว หรือจะประกอบคืนรูป frontend ก็ได้
    return { id: tripId };
  }

  // อ่านทริปเป็นรูป frontend
async getTripAsFrontShape(tripId: string) {
  const trip = await this.prisma.tripPlan.findUnique({
    where: { id: tripId },
    include: {
      units: {
        include: {
          place: {
            select: {
              name: true,
              description: true,
              // 👇 ใช้ label/lat/lng ให้ตรงกับโมเดล Location จริง
              location: { select: { name: true, lat: true, long: true } },
            },
          },
        },
      },
      // ถ้าอยากกำหนด field ชัด ๆ ก็ใช้ select ได้:
      // tripServices: { select: { serviceId: true, status: true, date: true, meta: true } },
      tripServices: true,
    },
  });

  if (!trip) throw new NotFoundException('Trip not found');
  if (!trip.startDate) throw new BadRequestException('Trip has no startDate');

  const startDate = new Date(trip.startDate);
  const diffDays = (a: Date, b: Date) =>
    Math.floor((a.getTime() - b.getTime()) / (24 * 3600 * 1000));

  // group by dateOffset
  const daysMap = new Map<
    number,
    { day: number; dayLabel: string; dateOffset: number; events: any[]; services: any[] }
  >();

  // units -> events
  for (const u of trip.units) {
    if (!u.timeStampStart) continue;
    const offset = diffDays(new Date(u.timeStampStart), startDate);
    if (!daysMap.has(offset)) {
      daysMap.set(offset, {
        day: offset,
        dayLabel: `Day ${offset + 1}`,
        dateOffset: offset,
        events: [],
        services: [],
      });
    }

    const start = new Date(u.timeStampStart);
    const hh = String(start.getUTCHours()).padStart(2, '0');
    const mm = String(start.getUTCMinutes()).padStart(2, '0');

    const L = u.place?.location; // { label, lat, lng } | null

    daysMap.get(offset)!.events.push({
      title: u.place?.name ?? u.note ?? 'Visit',
      desc: u.note ?? u.place?.description ?? undefined,
      time: `${hh}.${mm}`,
      location: L
        ? {
            label: L.name ?? u.place?.name ?? 'Unknown',
            lat: typeof L.lat === 'number' ? L.lat : undefined,
            lng: typeof L.long === 'number' ? L.long : undefined,
          }
        : undefined,
    });
  }

  // tripServices -> services (อ่านจาก meta JSON)
  for (const s of trip.tripServices) {
    if (!s.date) continue;
    const offset = diffDays(new Date(s.date), startDate);
    if (!daysMap.has(offset)) {
      daysMap.set(offset, {
        day: offset,
        dayLabel: `Day ${offset + 1}`,
        dateOffset: offset,
        events: [],
        services: [],
      });
    }

    // meta: Prisma.JsonValue | null
    const rawMeta = (s as { meta?: Prisma.JsonValue }).meta ?? null;

    // ปลอดภัยด้วยการแปลงเป็น Record<string, any> แล้วค่อยดึง
    const metaObj: Record<string, any> | null =
      rawMeta && typeof rawMeta === 'object' && !Array.isArray(rawMeta)
        ? (rawMeta as Record<string, any>)
        : null;

    const roomId =
      metaObj && typeof metaObj['roomId'] === 'string' ? (metaObj['roomId'] as string) : undefined;
    const packageId =
      metaObj && typeof metaObj['packageId'] === 'string' ? (metaObj['packageId'] as string) : undefined;
    const quantity =
      metaObj && typeof metaObj['quantity'] === 'number' ? (metaObj['quantity'] as number) : undefined;

    daysMap.get(offset)!.services.push({
      id: s.serviceId,
      type: s.status,
      roomId,
      packageId,
      quantity,
    });
  }

  const days = Array.from(daysMap.values()).sort((a, b) => a.day - b.day);

  return {
    title: trip.tripName,
    isPublic: trip.status === 'public',
    startDate: trip.startDate?.toISOString(),
    endDate: trip.endDate?.toISOString(),
    days,
  };
}


}
