import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchQueryDto} from './dto/search_query.dto';

type Paginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};

function parsePaging(q: SearchQueryDto) {
  const page = Math.max(1, Number(q.page ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.pageSize ?? 20)));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}
@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  /* ------- HOTELS ------- */
async searchHotels(q: SearchQueryDto, req: any): Promise<Paginated<any>> {
  const { page, pageSize, skip, take } = parsePaging(q);

  // amenities -> array เสมอ
  let amenities = q.amenities as string[] | string | undefined;
  if (typeof amenities === 'string') {
    amenities = amenities.split(',').map(a => a.trim()).filter(Boolean);
  }
  if (!Array.isArray(amenities)) amenities = [];
  const amenityMode: 'any' | 'all' = (q as any).amenityMode === 'all' ? 'all' : 'any';

  const kw = q.q?.trim();
  const priceMin = q.priceMin != null ? Number(q.priceMin) : undefined;
  const priceMax = q.priceMax != null ? Number(q.priceMax) : undefined;
  const ratingMin = q.ratingMin != null ? Number(q.ratingMin) : undefined;

  // ✅ include ตรงตามรูปที่ต้องการ
// ✅ Helper: include โครงสร้างตามที่ต้องการ
const buildInclude = (req: any) => {
  const userId = (req?.query?.userId as string | undefined) || undefined;

  // ถ้ามี userId → include bookmarks แบบกรอง
  if (userId) {
    return {
      rooms: { include: { options: true } },
      service: {
        include: {
          reviews: true,
          location: true,
          bookmarks: { where: { userId } },
        },
      },
    };
  }

  // ถ้าไม่มี userId → ไม่ include bookmarks
  return {
    rooms: { include: { options: true } },
    service: {
      include: {
        reviews: true,
        location: true,
      },
    },
  };
};

  // ✅ WHERE
  const where: any = {
    AND: [
      kw
        ? {
            OR: [
              { name: { contains: kw, mode: 'insensitive' } },
              { description: { contains: kw, mode: 'insensitive' } },
              {
                service: {
                  location: {
                    OR: [
                      { name: { contains: kw, mode: 'insensitive' } },
                      { province: { contains: kw, mode: 'insensitive' } },
                      { district: { contains: kw, mode: 'insensitive' } },
                      { address: { contains: kw, mode: 'insensitive' } },
                      { country: { contains: kw, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {},
      ratingMin !== undefined ? { rating: { gte: ratingMin as any } } : {},
      amenities.length
        ? amenityMode === 'all'
          ? { AND: amenities.map(a => ({ facilities: { array_contains: a } })) }
          : { OR: amenities.map(a => ({ facilities: { array_contains: a } })) }
        : {},
      priceMin !== undefined
        ? { rooms: { some: { options: { some: { price: { gte: priceMin as any } } } } } }
        : {},
      priceMax !== undefined
        ? { rooms: { some: { options: { some: { price: { lte: priceMax as any } } } } } }
        : {},
    ].filter(Boolean),
  };

  const wantsPriceSort = q.sortBy === 'price';
  const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';

  // ✅ sort ตามราคาต่ำสุดของห้อง (RoomOption.price)
  if (wantsPriceSort) {
    const idList = await this.prisma.hotel.findMany({ where, select: { id: true } });
    const hotelIds = idList.map(h => h.id);
    const total = hotelIds.length;

    if (total === 0) {
      return { data: [], page, pageSize, total: 0, hasMore: false };
    }

    const minPrices = await this.prisma.roomOption.groupBy({
      by: ['hotelId'],
      where: { hotelId: { in: hotelIds } },
      _min: { price: true },
    });

    const priceMap = new Map<string, number | null>(
      minPrices.map(mp => [mp.hotelId, (mp._min.price as any) ?? null]),
    );
    for (const id of hotelIds) if (!priceMap.has(id)) priceMap.set(id, null);

    const pairs = Array.from(priceMap.entries()).map(([id, minPrice]) => ({ id, minPrice }));
    pairs.sort((a, b) => {
      if (a.minPrice == null && b.minPrice == null) return 0;
      if (a.minPrice == null) return 1;
      if (b.minPrice == null) return -1;
      return sortOrder === 'asc'
        ? Number(a.minPrice) - Number(b.minPrice)
        : Number(b.minPrice) - Number(a.minPrice);
    });

    const pageIds = pairs.slice(skip, skip + take).map(p => p.id);
    if (pageIds.length === 0) {
      return { data: [], page, pageSize, total, hasMore: false };
    }

    const items = await this.prisma.hotel.findMany({
      where: { id: { in: pageIds } },
      include: buildInclude(req),
    });

    // รักษาลำดับ
    const orderMap = new Map(pageIds.map((id, idx) => [id, idx]));
    items.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

    return {
      data: items,
      page,
      pageSize,
      total,
      hasMore: skip + items.length < total,
    };
  }

  // ✅ sort ปกติ
  let orderBy: any = undefined;
  switch (q.sortBy) {
    case 'rating':
      orderBy = { rating: sortOrder };
      break;
    case 'name':
      orderBy = { name: sortOrder };
      break;
    case 'createdAt':
      orderBy = { service: { createdAt: sortOrder } };
      break;
    default:
      orderBy = undefined;
  }

  const [total, items] = await this.prisma.$transaction([
    this.prisma.hotel.count({ where }),
    this.prisma.hotel.findMany({
      where,
      orderBy,
      skip,
      take,
      include: buildInclude(req),
    }),
  ]);

  return {
    data: items,
    page,
    pageSize,
    total,
    hasMore: skip + items.length < total,
  };
}

 

  /* ------- RESTAURANTS ------- */
async searchRestaurants(q: SearchQueryDto, req: any): Promise<Paginated<any>> {
  // ——— paging ———
  const { page, pageSize, skip, take } = parsePaging(q);

  // ——— keyword (ชื่อร้านเท่านั้น) ———
  const kw = q.q?.trim();

  // ——— include helper ———
  const userId = (req?.query?.userId as string | undefined) || undefined;
  const buildInclude = (uid?: string) => {
    const serviceInclude: any = {
      reviews: true,
      location: true,
    };
    if (uid) {
      serviceInclude.bookmarks = { where: { userId: uid } }; // มี userId → include เฉพาะบุ๊กมาร์กของคนนั้น
    }
    return {
      // ใส่ tables เพื่อดึงราคาต่ำสุดไว้แสดงผล (ไม่ใช่ filter)
      tables: {
        orderBy: { pricePerSeat: 'asc' as const },
        take: 1,
        select: { pricePerSeat: true },
      },
      service: { include: serviceInclude },
    };
  };

  // ——— where: ค้นเฉพาะชื่อเท่านั้น ———
  const where = kw
    ? { name: { contains: kw, mode: 'insensitive' as const } }
    : {};

  // ——— orderBy แบบเบา ๆ (ไม่บังคับ) ———
  // ถ้าอยากกำหนดเองจาก q.sortBy ก็เติมได้ภายหลัง
  const orderBy: any = { name: 'asc' as const };

  // ——— query ———
  const [total, items] = await this.prisma.$transaction([
    this.prisma.restaurant.count({ where }),
    this.prisma.restaurant.findMany({
      where,
      orderBy,
      skip,
      take,
      include: buildInclude(userId),
    }),
  ]);

  // ——— เติม field แสดงผลราคาเริ่มต้นต่อที่นั่ง (เฉพาะแสดงผล) ———
  const data = items.map((r: any) => ({
    ...r,
    priceMinPerSeat: r.tables?.[0]?.pricePerSeat ?? null,
  }));

  return {
    data,
    page,
    pageSize,
    total,
    hasMore: skip + data.length < total,
  };
}







  /* ------- ATTRACTIONS ------- */
async searchAttractions(q: SearchQueryDto, req: any): Promise<Paginated<any>> {
  const { page, pageSize, skip, take } = parsePaging(q);

  // ✅ คีย์เวิร์ด
  const keyword = q.q?.trim();

  // ✅ WHERE (เหมือนเดิม: ค้น name/description + ข้ามไปค้นใน location ด้วย)
  const where: any = {
    AND: [
      keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
              {
                location: {
                  OR: [
                    { name: { contains: keyword, mode: 'insensitive' } },
                    { country: { contains: keyword, mode: 'insensitive' } },
                    { province: { contains: keyword, mode: 'insensitive' } },
                    { district: { contains: keyword, mode: 'insensitive' } },
                    { address: { contains: keyword, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {},
    ].filter(Boolean),
  };

  // ✅ ORDER BY
  let orderBy: any = undefined;
  const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';
  switch (q.sortBy) {
    case 'name':
      orderBy = { name: sortOrder };
      break;
    case 'createdAt':
      // อิงเวลาสร้างจาก Location (ตามเดิม)
      orderBy = { location: { createdAt: sortOrder } };
      break;
    default:
      orderBy = undefined;
  }

  // ✅ include helper (เหมือน hotel: คืน include ตรง)
  const buildInclude = () => ({
    location: true,
    reviews: true,
  });

  // ✅ Query แบบ include และส่งออก items ตรง ๆ
  const [total, items] = await this.prisma.$transaction([
    this.prisma.place.count({ where }),
    this.prisma.place.findMany({
      where,
      orderBy,
      skip,
      take,
      include: buildInclude(),
    }),
  ]);

  return {
    data: items, // ส่งโครงสร้างจาก include ตรง ๆ
    page,
    pageSize,
    total,
    hasMore: skip + items.length < total,
  };
}


  /* ------- RENTAL CARS ------- */
async searchRentals(q: SearchQueryDto, req: any): Promise<Paginated<any>> {
  const { page, pageSize, skip, take } = parsePaging(q);

  // --- keyword / filters (เดิม) ---
  const keyword = q.q?.trim();
  let amenities = q.amenities as string[] | string | undefined;
  if (typeof amenities === 'string') {
    amenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(amenities)) amenities = [];
  const amenityList = Array.from(new Set(amenities));

  const where: any = {
    AND: [
      keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
              { cars: { some: { model: { contains: keyword, mode: 'insensitive' } } } },
              {
                service: {
                  location: {
                    OR: [
                      { name: { contains: keyword, mode: 'insensitive' } },
                      { province: { contains: keyword, mode: 'insensitive' } },
                      { district: { contains: keyword, mode: 'insensitive' } },
                      { address: { contains: keyword, mode: 'insensitive' } },
                      { country: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {},
      q.priceMin ? { cars: { some: { pricePerDay: { gte: Number(q.priceMin) } } } } : {},
      q.priceMax ? { cars: { some: { pricePerDay: { lte: Number(q.priceMax) } } } } : {},
      q.ratingMin ? { rating: { gte: Number(q.ratingMin) } } : {},
      amenityList.length
        ? {
            OR: amenityList.map(kw => ({
              description: { contains: kw, mode: 'insensitive' },
            })),
          }
        : {},
    ].filter(Boolean),
  };

  // --- include helper (เหมือน hotel) ---
  const buildInclude = (req: any) => {
    const userId = (req?.query?.userId as string | undefined) || undefined;

    // ถ้ามี userId → include bookmarks แบบ where; ถ้าไม่มี → ไม่ include bookmarks
    const serviceInclude: any = {
      reviews: true,
      location: true,
    };
    if (userId) {
      serviceInclude.bookmarks = { where: { userId } };
    }

    return {
      // ดึงรถทั้งหมดของสาขานี้ (จะใช้เฉพาะกรณีแสดงรายละเอียด/หน้า list ก็ได้)
      cars: true,
      service: { include: serviceInclude },
    };
  };

  const wantsPriceSort = q.sortBy === 'price';
  const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';

  // ====== เรียงตาม "ราคาต่ำสุดของสาขา" (min cars.pricePerDay) ======
  if (wantsPriceSort) {
    // 1) หา id ทั้งหมดที่ผ่าน where
    const idList = await this.prisma.carRentalCenter.findMany({ where, select: { id: true } });
    const centerIds = idList.map(c => c.id);
    const total = centerIds.length;
    if (total === 0) {
      return { data: [], page, pageSize, total: 0, hasMore: false };
    }

    // 2) groupBy table Car เพื่อหาขั้นต่ำต่อสาขา
    const minByCenter = await this.prisma.car.groupBy({
      by: ['crcId'],
      where: { crcId: { in: centerIds } },
      _min: { pricePerDay: true },
    });

    const priceMap = new Map<string, number | null>(
      minByCenter.map(m => [m.crcId, (m._min.pricePerDay as any) ?? null]),
    );
    for (const id of centerIds) if (!priceMap.has(id)) priceMap.set(id, null);

    // 3) จัดเรียงตาม min price
    const pairs = Array.from(priceMap.entries()).map(([id, minPrice]) => ({ id, minPrice }));
    pairs.sort((a, b) => {
      if (a.minPrice == null && b.minPrice == null) return 0;
      if (a.minPrice == null) return 1;
      if (b.minPrice == null) return -1;
      return sortOrder === 'asc'
        ? Number(a.minPrice) - Number(b.minPrice)
        : Number(b.minPrice) - Number(a.minPrice);
    });

    // 4) ตัดหน้าแล้วดึงด้วย include
    const pageIds = pairs.slice(skip, skip + take).map(p => p.id);
    if (pageIds.length === 0) {
      return { data: [], page, pageSize, total, hasMore: false };
    }

    const items = await this.prisma.carRentalCenter.findMany({
      where: { id: { in: pageIds } },
      include: buildInclude(req),
    });

    // รักษาลำดับตาม pageIds
    const orderMap = new Map(pageIds.map((id, idx) => [id, idx]));
    items.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

    // ✅ คืน include ตรง ๆ (สไตล์เดียวกับ hotel)
    return {
      data: items,
      page,
      pageSize,
      total,
      hasMore: skip + items.length < total,
    };
  }

  // ====== เรียงปกติ (ไม่ใช่ price) ======
  let orderBy: any = undefined;
  switch (q.sortBy) {
    case 'rating':
      orderBy = { rating: sortOrder };
      break;
    case 'name':
      orderBy = { name: sortOrder };
      break;
    case 'createdAt':
      orderBy = { service: { createdAt: sortOrder } };
      break;
    default:
      orderBy = undefined;
  }

  const [total, items] = await this.prisma.$transaction([
    this.prisma.carRentalCenter.count({ where }),
    this.prisma.carRentalCenter.findMany({
      where,
      orderBy,
      skip,
      take,
      include: buildInclude(req), // ✅ include แบบเดียวกับ hotel
    }),
  ]);

  return {
    data: items, // ✅ ส่งโครงสร้างจาก include ตรง ๆ
    page,
    pageSize,
    total,
    hasMore: skip + items.length < total,
  };
}




  /* ------- GUIDES (ไกด์ท้องถิ่น) ------- */
async searchGuides(q: SearchQueryDto, req: any): Promise<Paginated<any>> {
  const { page, pageSize, skip, take } = parsePaging(q);

  // ✅ amenities -> array เสมอ
  let amenities = q.amenities as string[] | string | undefined;
  if (typeof amenities === 'string') {
    amenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(amenities)) amenities = [];
  const amenityList = Array.from(new Set(amenities));

  // ✅ keyword
  const keyword = q.q?.trim();

  // ✅ ภาษาที่เลือก (any/all) — สคีม่าใช้ `languages: String[]`
  let rawLang = (q as any).language as string | string[] | undefined;
  if (Array.isArray(rawLang)) rawLang = rawLang.join(',');
  const languageMode: 'any' | 'all' = (q as any).languageMode === 'all' ? 'all' : 'any';
  const languages =
    rawLang ? Array.from(new Set(rawLang.split(',').map(s => s.trim()).filter(Boolean))) : [];

  // ✅ include helper (เหมือน hotel) — เงื่อนไข bookmark ตาม userId
  const buildInclude = (req: any) => {
    const userId = (req?.query?.userId as string | undefined) || undefined;
    const serviceInclude: any = {
      reviews: true,
      location: true,
    };
    if (userId) {
      serviceInclude.bookmarks = { where: { userId } };
    }
    return {
      service: { include: serviceInclude },
    };
  };

  // ✅ WHERE (รองรับ name/description/ภาษา + คีย์เวิร์ดในที่ตั้ง)
  const where: any = {
    AND: [
      keyword
        ? {
            OR: [
              { name: { contains: keyword, mode: 'insensitive' } },
              { description: { contains: keyword, mode: 'insensitive' } },
              // languages เป็น array → ใช้ has
              { languages: { has: keyword } },
              {
                service: {
                  location: {
                    OR: [
                      { name: { contains: keyword, mode: 'insensitive' } },
                      { province: { contains: keyword, mode: 'insensitive' } },
                      { district: { contains: keyword, mode: 'insensitive' } },
                      { address: { contains: keyword, mode: 'insensitive' } },
                      { country: { contains: keyword, mode: 'insensitive' } },
                    ],
                  },
                },
              },
            ],
          }
        : {},

      // language filters (ตรงสคีม่า: languages:String[])
      languages.length
        ? languageMode === 'all'
          ? { AND: languages.map(l => ({ languages: { has: l } })) }
          : { OR: languages.map(l => ({ languages: { has: l } })) }
        : {},

      // price range
      q.priceMin != null ? { pay: { gte: Number(q.priceMin) } } : {},
      q.priceMax != null ? { pay: { lte: Number(q.priceMax) } } : {},

      // rating
      q.ratingMin != null ? { rating: { gte: Number(q.ratingMin) } } : {},

      // amenities → ค้นใน description
      amenityList.length
        ? {
            OR: amenityList.map(kw => ({
              description: { contains: kw, mode: 'insensitive' },
            })),
          }
        : {},
    ].filter(Boolean),
  };

  // ✅ Sorting
  let orderBy: any = undefined;
  const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';
  switch (q.sortBy) {
    case 'price':
      orderBy = { pay: sortOrder };
      break;
    case 'rating':
      orderBy = { rating: sortOrder };
      break;
    case 'name':
      orderBy = { name: sortOrder };
      break;
    case 'createdAt':
      orderBy = { service: { createdAt: sortOrder } };
      break;
    default:
      orderBy = undefined;
  }

  // ✅ Prisma query — ส่ง include ตรง ๆ
  const [total, items] = await this.prisma.$transaction([
    this.prisma.guide.count({ where }),
    this.prisma.guide.findMany({
      where,
      orderBy,
      skip,
      take,
      include: buildInclude(req),
    }),
  ]);

  return {
    data: items,        // ← ส่งโครงสร้างจาก include ตรง ๆ
    page,
    pageSize,
    total,
    hasMore: skip + items.length < total,
  };
}


}