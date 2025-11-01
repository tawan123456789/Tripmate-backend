import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserServiceDto } from './dto/create-user-service.dto';
import { CreateHotelDto } from 'src/hotel/dto/create-hotel.dto';
import { CreateRestaurantDto } from 'src/restaurant/dto/create-restaurant.dto';
import { UpdateUserServiceDto } from './dto/update-user-service.dto';
import { CreateCarRentalCenterDto } from 'src/car_rental_center/dto/create-car_rental_center.dto';
import { CreateGuideDto } from 'src/guide/dto/create-guide.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class UserServicesService {
  constructor(private prisma: PrismaService) {}

async createHotelService(
  dto: CreateUserServiceDto,
  createHotelDto: CreateHotelDto,
) {
  // ✅ ป้องกัน undefined + บังคับคีย์ที่ schema ต้องมี
  if (!dto) throw new BadRequestException('Missing dto');
  if (!dto.id) throw new BadRequestException('dto.id is required');
  if (!dto.ownerId) throw new BadRequestException('dto.ownerId is required');
  if (!dto.name) throw new BadRequestException('dto.name is required');

  // ถ้ากำหนดกติกาว่า Hotel.id ต้องเท่ากับ Service.id ให้ตรวจให้ตรง
  if (createHotelDto?.serviceId && createHotelDto.serviceId !== dto.id) {
    throw new BadRequestException('createHotelDto.serviceId must equal dto.id');
  }

  try {
    return await this.prisma.$transaction(async (tx) => {
      // 1) สร้าง UserService (type = 'hotel')
      const service = await tx.userService.create({
        data: {
          id: dto.id,                    // ถ้า schema คุณไม่มี @default(uuid()) ต้องส่งเสมอ
          // ownerId: dto.ownerId,
          // locationId: dto.locationId,  // ถ้าเป็น optional/nullable อย่าลืมปรับ schema ให้เป็น String?
          name: dto.name,
          description: dto.description,
          serviceImg: dto.serviceImg,
          status: dto.status,
          type: 'hotel',
          owner: { connect: { id: dto.ownerId } },
          location: dto.locationId ? { connect: { id: dto.locationId } } : undefined,
        },
      });

      // 2) สร้าง Hotel โดยใช้ PK เดียวกัน (หรือใช้ relation connect หาก schema เป็นคนละ PK)
      const { serviceId: _dropId, ...payload } = createHotelDto ?? ({} as CreateHotelDto);

      const hotel = await tx.hotel.create({
        data: {
          // ✅ ใช้ id เดียวกับ service ตามสัญญา
          id: service.id,

          name: payload.name ?? dto.name,
          type: payload.type ?? 'hotel',
          star: payload.star,

          description: payload.description,
          pictures: payload.pictures,

      
          facilities: payload.facilities as any,     // ถ้าเป็น Json ใน Prisma ใช้ as Prisma.JsonValue แทน
          rating: payload.rating as any,             // ถ้าเป็น Decimal ใส่เป็น string เช่น "4.5"

          checkIn: payload.checkIn,
          checkOut: payload.checkOut,
          breakfast: payload.breakfast,
          petAllow: payload.petAllow,

          contact: payload.contact,                  // ถ้าเป็น Json => Prisma.JsonValue


          subtopicRatings: payload.subtopicRatings as any,
          locationSummary: payload.locationSummary,
          nearbyLocations: payload.nearbyLocations,

          // 🔁 ถ้า schema คุณ “ไม่ได้แชร์ PK” แต่ใช้ FK/Relation:
          // service: { connect: { id: service.id } },
          // หรือถ้าเป็น FK ชื่อ serviceId:
          // serviceId: service.id,
        },
      });

      return { service, hotel };
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        // unique constraint (เช่น id ซ้ำ)
        throw new ConflictException('service/hotel ID already exists');
      }
      if (e.code === 'P2003') {
        // foreign key ผิด (ถ้าใช้ serviceId / relation connect แล้วไม่เจอ)
        throw new BadRequestException(
          `Foreign key constraint failed (${(e.meta as any)?.constraint ?? 'unknown constraint'})`,
        );
      }
      if (e.code === 'P2023') {
        // รูปแบบ UUID/ID ไม่ถูกต้อง
        throw new BadRequestException('Invalid UUID/ID format in id/ownerId/locationId');
      }
    }
    throw e;
  }
}

    async createRestaurantService(
    dto: CreateUserServiceDto,
    createRestaurantDto: CreateRestaurantDto,
  ) {
    // ✅ ป้องกันค่า undefined ตั้งแต่ต้น (สำคัญเพราะ schema ของคุณบังคับ id)
    if (!dto) throw new BadRequestException('Missing dto');
    if (!dto.id) throw new BadRequestException('dto.id is required');
    if (!dto.ownerId) throw new BadRequestException('dto.ownerId is required');
    if (!dto.name) throw new BadRequestException('dto.name is required');

    // ถ้า DTO ร้านกำหนดว่า id ต้อง “ตรงกับ” service.id ให้เช็ค/เซ็ตให้ตรง
    if (createRestaurantDto?.id && createRestaurantDto.id !== dto.id) {
      throw new BadRequestException('createRestaurantDto.id must equal dto.id');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) สร้าง UserService
        const service = await tx.userService.create({
          data: {
            id: dto.id, // Prisma ของคุณต้องการ id ชัดเจน (ไม่มี default)
            name: dto.name,
            description: dto.description,
            serviceImg: dto.serviceImg,
            status: dto.status,
            type: 'restaurant',
            owner: { connect: { id: dto.ownerId } },
            location: dto.locationId ? { connect: { id: dto.locationId } } : undefined,
          },
        });

        // 2) สร้าง Restaurant
        const {
          id: _ignoreId, // ไม่ส่งต่อ id จาก body; ใช้ service.id เป็นหลัก
          ...payload
        } = createRestaurantDto ?? ({} as CreateRestaurantDto);

        const restaurant = await tx.restaurant.create({
          data: {
            // ใช้ PK เดียวกัน (ตามเงื่อนไข DTO ของคุณ)
            id: service.id,

            name: payload.name ?? dto.name,
            type: payload.type ?? 'restaurant',
            cuisine: payload.cuisine,
            priceLevel: payload.priceLevel,

            description: payload.description,
            menu: payload.menu,
            image: payload.image,

            pictures: payload.pictures,
            facility: payload.facility,

            facilities: payload.facilities as any,
            rating: payload.rating as any, // "8.7" หรือ number

            subtopicRatings: payload.subtopicRatings as any,

            locationSummary: payload.locationSummary,
            nearbyLocations: payload.nearbyLocations,

            contact: payload.contact,
            contacts: payload.contacts as any,

            openingHours: payload.openingHours as any,
            reservationPolicy: payload.reservationPolicy as any,

            petAllow: payload.petAllow,
            dietaryTags: payload.dietaryTags,
            services: payload.services,
            paymentMethods: payload.paymentMethods,

            // ถ้า schema ของคุณใช้ relation object แทน PK เดียว:
            // service: { connect: { id: service.id } },
            // หรือถ้าใช้ FK ชื่อ serviceId:
            // serviceId: service.id,
          },
        });

        return { service, restaurant };
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('service/restaurant ID already exists');
        }
        if (e.code === 'P2003') {
          throw new BadRequestException(
            `Foreign key constraint failed (${e.meta?.constraint ?? 'unknown constraint'})`,
          );
        }
        if (e.code === 'P2023') {
          throw new BadRequestException(
            'Invalid UUID/ID format in id/ownerId/locationId',
          );
        }
      }
      throw e;
    }
  }

  async createCarRentalService(dto: CreateUserServiceDto, createCrcDto: CreateCarRentalCenterDto) {
    // ตรวจค่าบังคับกันพลาดก่อน
    if (!dto) throw new BadRequestException('Missing dto');
    if (!dto.id) throw new BadRequestException('dto.id is required');
    if (!dto.ownerId) throw new BadRequestException('dto.ownerId is required');
    if (!dto.name) throw new BadRequestException('dto.name is required');

    // ถ้าอยากให้ PK ของ CarRentalCenter เท่ากับ service.id เหมือน Restaurant/Hotel:
    if (createCrcDto?.id && createCrcDto.id !== dto.id) {
      throw new BadRequestException('createCarRentalCenterDto.id must equal dto.id');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) สร้าง UserService (type บังคับให้ชัด)
        const service = await tx.userService.create({
          data: {
            id: dto.id,                 // ถ้า schema มี @default(uuid()) จะละได้
            name: dto.name,
            description: dto.description,
            serviceImg: dto.serviceImg,
            status: dto.status,
            type: 'car_rental_center',  // หรือ 'car_rental' ตาม schema ของคุณ
            owner: { connect: { id: dto.ownerId } },
            location: dto.locationId ? { connect: { id: dto.locationId } } : undefined,
          },
        });

        // 2) สร้าง CarRentalCenter
        //    - เลือก “PK เดียวกับ service.id” + “connect relation” เพื่อกันพลาดชื่อ FK
        const { id: _ignore, ...payload } = createCrcDto as any;

        const carRentalCenter = await tx.carRentalCenter.create({
          data: {
            // ✅ ใช้ PK เดียวกับ service (ถ้า schema อนุญาต)
            id: service.id,

            name: payload.name ?? dto.name,
            type: payload.type ?? 'car_rental_center',
            description: payload.description,
            image: payload.image,

            pictures: payload.pictures,
          
            facilities: payload.facilities as any,

            rating: payload.rating as any, // Decimal(3,1) เป็น string "8.7" ก็ได้
            subtopicRatings: payload.subtopicRatings as any,


            nearbyLocations: payload.nearbyLocations,
            contacts: payload.contacts as any,
            openingHours: payload.openingHours as any,
      
            branches: payload.branches as any,

            paymentMethods: payload.paymentMethods,
            requiredDocs: payload.requiredDocs,

            // ✅ ผูก relation ชัดเจน (เปลี่ยนชื่อฟิลด์ให้ตรงกับ model ของคุณ ถ้าไม่ใช่ 'service')

            // หรือถ้า model ใช้ FK ชื่อ serviceId (unchecked input):
            // serviceId: service.id,
          },
        });

        return { service, carRentalCenter };
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('service/carRentalCenter ID already exists');
        }
        if (e.code === 'P2003') {
          throw new BadRequestException(
            `Foreign key constraint failed (${e.meta?.constraint ?? 'unknown constraint'})`,
          );
        }
        if (e.code === 'P2023') {
          throw new BadRequestException('Invalid UUID/ID format in id/ownerId/locationId');
        }
      }
      throw e;
    }
  }

  async createGuideService(dto: CreateUserServiceDto, createGuideDto: CreateGuideDto) {
    // ✅ validate ขั้นต้นกันค่า undefined
    if (!dto) throw new BadRequestException('Missing dto');
    if (!dto.id) throw new BadRequestException('dto.id is required');
    if (!dto.ownerId) throw new BadRequestException('dto.ownerId is required');
    if (!dto.name) throw new BadRequestException('dto.name is required');

    // ถ้า design ให้ PK ของ Guide เท่ากับ service.id ให้บังคับให้ตรง
    if (createGuideDto?.id && createGuideDto.id !== dto.id) {
      throw new BadRequestException('createGuideDto.id must equal dto.id');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        // 1) สร้าง UserService (type = 'guide')
        const service = await tx.userService.create({
          data: {
            id: dto.id,                 // ถ้ามี @default(uuid()) จะละได้
            name: dto.name,
            description: dto.description,
            serviceImg: dto.serviceImg,
            status: dto.status,
            owner: { connect: { id: dto.ownerId } },
            location: dto.locationId ? { connect: { id: dto.locationId } } : undefined,
            type: 'guide',
          },
        });

        // 2) สร้าง Guide — แบบ “ใช้ PK เดียวกับ service.id”
        const {
          id: _ignore, // ไม่ส่ง id จาก body ต่อ ให้ใช้ service.id
          ...payload
        } = createGuideDto as any;

        const guide = await tx.guide.create({
          data: {
            id: service.id, // ✅ ใช้ PK เดียวกับ UserService

            name: payload.name ?? dto.name,
            description: payload.description,
            image: payload.image,
            pictures: payload.pictures,

            rating: payload.rating as any,                // Decimal(3,1) เช่น "8.7"
            subtopicRatings: payload.subtopicRatings as any,

            languages: payload.languages,
            licenseId: payload.licenseId,
            verified: payload.verified,
            experienceYears: payload.experienceYears,
            specialties: payload.specialties,
            regionsCovered: payload.regionsCovered,

            pay: payload.pay as any,                      // Decimal(10,2) เป็น string ได้
            hourlyRate: payload.hourlyRate as any,
            dayRate: payload.dayRate as any,
            overtimeRate: payload.overtimeRate as any,
            currency: payload.currency,

            contact: payload.contact,
            contacts: payload.contacts as any,

            availability: payload.availability as any,    // JSON แบบยืดหยุ่น
            policies: payload.policies as any,

            locationSummary: payload.locationSummary,
            nearbyLocations: payload.nearbyLocations,            // ถ้า model ใช้ FK แยกชื่อ serviceId
          },
        });

        return { service, guide };
      });
    } catch (e: any) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new ConflictException('service/guide ID already exists');
        }
        if (e.code === 'P2003') {
          throw new BadRequestException(
            `Foreign key constraint failed (${e.meta?.constraint ?? 'unknown constraint'})`,
          );
        }
        if (e.code === 'P2023') {
          throw new BadRequestException(
            'Invalid UUID/ID format in id/ownerId/locationId',
          );
        }
      }
      throw e;
    }
  }

  
  

  findAll() {
    return this.prisma.userService.findMany();
  }


  async findOne(id: string) {
    const user = await this.prisma.userService.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async update(id: string, dto: UpdateUserServiceDto) {
    try {
          return await this.prisma.userService.update({
            where: { id },
            data: {
              ...dto,
            },
          });
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('user-service not found');
          }
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
            throw new ConflictException('user-service id already exists');
          }
          throw e;
        }
  }

  async remove(id: string) {
    try {
          await this.prisma.userService.delete({ where: { id } });
          return { ok: true };
        } catch (e) {
          if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
            throw new NotFoundException('user-service not found');
          }
          throw e;
        }
  }

  async removeByOwner(ownerId: string) {
    try {
          await this.prisma.userService.deleteMany({ where: { ownerId } });
          return { ok: true };
        } catch (e) {
          throw e;
        }
  }
  async findByOwner(ownerId: string) {
    return this.prisma.userService.findMany({ where: { ownerId } });
  }

  async findByType(type: string) {
    return this.prisma.userService.findMany({ where: { type } });
  }


}
