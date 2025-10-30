import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { randomAlphanumeric } from '../utils/random.util';
import { CreateTripPlanDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TripService {
  constructor(private prisma: PrismaService) {}

  async create(createTripDto: CreateTripPlanDto) {
    // basic validation
    if (!createTripDto.ownerId) {
      throw new BadRequestException('ownerId is required');
    }

    const tripId = `${randomAlphanumeric(8)}`;

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
    if (Array.isArray(createTripDto.days)) {
      for (const day of createTripDto.days) {
        if (!Array.isArray(day.events)) continue;
        for (const ev of day.events) {
          // only create a TripUnit when placeId is provided (model requires placeId)
          if (!ev.placeId) continue;
          units.push({
            id: `${randomAlphanumeric(10)}`,
            tripId: tripId,
            placeId: ev.placeId,
            timeStampStart: new Date(ev.startAt),
            duration: ev.durationMinutes,
            status: ev.status,
            note: ev.note,
          });
        }
      }
    }

    if (units.length > 0) {
      // createMany for performance
      await this.prisma.tripUnit.createMany({ data: units });
    }

    // return created trip with units
    return this.prisma.tripPlan.findUnique({
      where: { id: tripId },
      include: { units: true },
    });
  }

  findAll() {
    return `This action returns all trip`;
  }

  findOne(id: number) {
    return `This action returns a #${id} trip`;
  }

  update(id: number, updateTripDto: UpdateTripDto) {
    return `This action updates a #${id} trip`;
  }

  remove(id: number) {
    return `This action removes a #${id} trip`;
  }
}
