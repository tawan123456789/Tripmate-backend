// import { Injectable, BadRequestException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { SearchQueryDto, SortOrder } from './dto/search_query.dto';

// type Paginated<T> = {
//   data: T[];
//   page: number;
//   pageSize: number;
//   total: number;
//   hasMore: boolean;
// };

// function parsePaging(q: SearchQueryDto) {
//   const page = Math.max(1, parseInt(q.page ?? '1', 10));
//   const pageSize = Math.min(100, Math.max(1, parseInt(q.pageSize ?? '20', 10)));
//   const skip = (page - 1) * pageSize;
//   return { page, pageSize, skip, take: pageSize };
// }
// function buildFacilityClause(amenities: string[] = [], mode: 'any' | 'all' = 'any') {
//   if (!amenities.length) return {};
//   const patterns = amenities
//     .map(a => a?.toLowerCase().trim())
//     .filter(Boolean)
//     .map(a => `;${a};`); // match แบบคำเต็ม

//   const each = (p: string) => ({ facility: { contains: p, mode: 'insensitive' } });
//   return mode === 'all'
//     ? { AND: patterns.map(p => each(p)) } // ต้องมีครบทุกอัน
//     : { OR: patterns.map(p => each(p)) }; // อย่างน้อยหนึ่งอัน
// }

// function buildSort(sortBy?: string, sortOrder: SortOrder = 'asc') {
//   if (!sortBy) return undefined;
//   // map ชื่อฟิลด์หน้าบ้าน -> ฟิลด์จริงในตาราง
//   const map: Record<string, any> = {
//     price: { priceFrom: sortOrder },      // ตัวอย่าง hotel/restaurant มีราคาเริ่มต้น
//     rating: { ratingAvg: sortOrder },     // ถ้าคุณมีตาราง review + avg rating materialized
//     name: { name: sortOrder },
//     createdAt: { createdAt: sortOrder },
//     // distance ทำแยกด้วย raw SQL (ดูส่วน geo)
//   };
//   return map[sortBy] ?? undefined;
// }

// @Injectable()
// export class SearchService {
//   constructor(private readonly prisma: PrismaService) {}

//   /* ------- HOTELS ------- */
// async searchHotels(q: SearchQueryDto): Promise<Paginated<any>> {
//   const { page, pageSize, skip, take } = parsePaging(q);

//   // ✅ แปลง amenities ให้เป็น array เสมอ
//   let amenities = q.amenities as string[] | string | undefined;

//   if (typeof amenities === 'string') {
//     amenities = amenities
//       .split(',')
//       .map(a => a.trim())
//       .filter(Boolean);
//   }

//   if (!Array.isArray(amenities)) {
//     amenities = [];
//   }

//   const amenityMode: 'any' | 'all' =
//     (q as any).amenityMode === 'all' ? 'all' : 'any';

//   const facilityPatterns = amenities
//     .map(a => a?.toLowerCase().trim())
//     .filter(Boolean)
//     .map(a => `;${a};`);

//   const kw = q.q?.trim();
//   const priceMin = q.priceMin ? Number(q.priceMin) : undefined;
//   const priceMax = q.priceMax ? Number(q.priceMax) : undefined;
//   const ratingMin = q.ratingMin ? Number(q.ratingMin) : undefined;

//   // ✅ WHERE
//   const where: any = {
//     AND: [
//       kw
//         ? {
//             OR: [
//               { name: { contains: kw, mode: 'insensitive' } },
//               { description: { contains: kw, mode: 'insensitive' } },
//               {
//                 service: {
//                   location: {
//                     OR: [
//                       { name: { contains: kw, mode: 'insensitive' } },
//                       { province: { contains: kw, mode: 'insensitive' } },
//                       { district: { contains: kw, mode: 'insensitive' } },
//                       { address: { contains: kw, mode: 'insensitive' } },
//                       { country: { contains: kw, mode: 'insensitive' } },
//                     ],
//                   },
//                 },
//               },
//             ],
//           }
//         : {},
//       priceMin !== undefined
//         ? { rooms: { some: { pricePerNight: { gte: priceMin } } } }
//         : {},
//       priceMax !== undefined
//         ? { rooms: { some: { pricePerNight: { lte: priceMax } } } }
//         : {},
//       ratingMin !== undefined ? { rating: { gte: ratingMin } } : {},
//       facilityPatterns.length
//         ? amenityMode === 'all'
//           ? {
//               AND: facilityPatterns.map(p => ({
//                 facility: { contains: p, mode: 'insensitive' },
//               })),
//             }
//           : {
//               OR: facilityPatterns.map(p => ({
//                 facility: { contains: p, mode: 'insensitive' },
//               })),
//             }
//         : {},
//     ].filter(Boolean),
//   };

//   const wantsPriceSort = q.sortBy === 'price';
//   const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';

//   if (wantsPriceSort) {
//     // ✅ ดึง ID + ราคาต่ำสุดของทุกโรงแรม
//     const allForSort = await this.prisma.hotel.findMany({
//       where,
//       select: {
//         id: true,
//         rooms: {
//           orderBy: { pricePerNight: 'asc' },
//           take: 1,
//           select: { pricePerNight: true },
//         },
//       },
//     });

//     const pairs = allForSort.map(h => ({
//       id: h.id,
//       minPrice: h.rooms?.[0]?.pricePerNight ?? null,
//     }));

//     pairs.sort((a, b) => {
//       if (a.minPrice == null && b.minPrice == null) return 0;
//       if (a.minPrice == null) return 1;
//       if (b.minPrice == null) return -1;
//       return sortOrder === 'asc'
//         ? Number(a.minPrice) - Number(b.minPrice)
//         : Number(b.minPrice) - Number(a.minPrice);
//     });

//     const total = pairs.length;
//     const pageIds = pairs.slice(skip, skip + take).map(p => p.id);

//     if (pageIds.length === 0) {
//       return { data: [], page, pageSize, total, hasMore: false };
//     }

//     const items = await this.prisma.hotel.findMany({
//       where: { id: { in: pageIds } },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         rating: true,
//         image: true,
//         facility: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//         rooms: {
//           orderBy: { pricePerNight: 'asc' },
//           take: 1,
//           select: { pricePerNight: true },
//         },
//       },
//     });

//     const orderMap = new Map(pageIds.map((id, idx) => [id, idx]));
//     items.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

//     const data = items.map(h => {
//       const loc = h.service?.location;
//       const minRoom = h.rooms?.[0]?.pricePerNight ?? null;
//       return {
//         id: h.id,
//         name: h.name,
//         description: h.description,
//         image: h.image,
//         facility: h.facility,
//         rating: h.rating,
//         location: loc
//           ? {
//               name: loc.name,
//               country: loc.country,
//               province: loc.province,
//               district: loc.district,
//               address: loc.address,
//               lat: loc.lat,
//               lng: loc.long,
//             }
//           : null,
//         priceMinPerNight: minRoom,
//         createdAt: h.service?.createdAt ?? null,
//       };
//     });

//     return {
//       data,
//       page,
//       pageSize,
//       total,
//       hasMore: skip + data.length < total,
//     };
//   }

//   // ✅ SORT ปกติ (ไม่ใช่ตามราคา)
//   let orderBy: any = undefined;
//   switch (q.sortBy) {
//     case 'rating':
//       orderBy = { rating: sortOrder };
//       break;
//     case 'name':
//       orderBy = { name: sortOrder };
//       break;
//     case 'createdAt':
//       orderBy = { service: { createdAt: sortOrder } };
//       break;
//     default:
//       orderBy = undefined;
//   }

//   const [total, items] = await this.prisma.$transaction([
//     this.prisma.hotel.count({ where }),
//     this.prisma.hotel.findMany({
//       where,
//       orderBy,
//       skip,
//       take,
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         rating: true,
//         image: true,
//         facility: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//         rooms: {
//           orderBy: { pricePerNight: 'asc' },
//           take: 1,
//           select: { pricePerNight: true },
//         },
//       },
//     }),
//   ]);

//   const data = items.map(h => {
//     const loc = h.service?.location;
//     const minRoom = h.rooms?.[0]?.pricePerNight ?? null;
//     return {
//       id: h.id,
//       name: h.name,
//       description: h.description,
//       image: h.image,
//       facility: h.facility,
//       rating: h.rating,
//       location: loc
//         ? {
//             name: loc.name,
//             country: loc.country,
//             province: loc.province,
//             district: loc.district,
//             address: loc.address,
//             lat: loc.lat,
//             lng: loc.long,
//           }
//         : null,
//       priceMinPerNight: minRoom,
//       createdAt: h.service?.createdAt ?? null,
//     };
//   });

//   return {
//     data,
//     page,
//     pageSize,
//     total,
//     hasMore: skip + data.length < total,
//   };
// }



//   /* ------- RESTAURANTS ------- */
// async searchRestaurants(q: SearchQueryDto): Promise<Paginated<any>> {
//   const { page, pageSize, skip, take } = parsePaging(q);

//   // ✅ แปลง amenities ให้เป็น array เสมอ
//   let amenities = q.amenities as string[] | string | undefined;
//   if (typeof amenities === 'string') {
//     amenities = amenities
//       .split(',')
//       .map(a => a.trim())
//       .filter(Boolean);
//   }
//   if (!Array.isArray(amenities)) {
//     amenities = [];
//   }

//   // ✅ where ตามสคีมาจริง (ใช้ได้กับทั้งสองรอบ)
//   const where: any = {
//     AND: [
//       q.q
//         ? {
//             OR: [
//               { name: { contains: q.q, mode: 'insensitive' } },
//               { description: { contains: q.q, mode: 'insensitive' } },
//               { menu: { contains: q.q, mode: 'insensitive' } },
//               {
//                 service: {
//                   location: {
//                     OR: [
//                       { name: { contains: q.q, mode: 'insensitive' } },
//                       { province: { contains: q.q, mode: 'insensitive' } },
//                       { district: { contains: q.q, mode: 'insensitive' } },
//                       { address: { contains: q.q, mode: 'insensitive' } },
//                       { country: { contains: q.q, mode: 'insensitive' } },
//                     ],
//                   },
//                 },
//               },
//             ],
//           }
//         : {},

//       q.priceMin
//         ? { tables: { some: { pricePerSeat: { gte: Number(q.priceMin) } } } }
//         : {},
//       q.priceMax
//         ? { tables: { some: { pricePerSeat: { lte: Number(q.priceMax) } } } }
//         : {},

//       // ✅ เรตติ้ง
//       q.ratingMin ? { rating: { gte: Number(q.ratingMin) } } : {},

//       // ✅ amenities → ค้นใน description/menu
//       amenities.length
//         ? {
//             OR: amenities.map(kw => ({
//               OR: [
//                 { description: { contains: kw, mode: 'insensitive' } },
//                 { menu: { contains: kw, mode: 'insensitive' } },
//               ],
//             })),
//           }
//         : {},
//     ].filter(Boolean),
//   };

//   const wantsPriceSort = q.sortBy === 'price';
//   const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';

//   // ✅ sort by price
//   if (wantsPriceSort) {
//     const allForSort = await this.prisma.restaurant.findMany({
//       where,
//       select: {
//         id: true,
//         tables: {
//           orderBy: { pricePerSeat: 'asc' },
//           take: 1,
//           select: { pricePerSeat: true },
//         },
//       },
//     });

//     const pairs = allForSort.map(r => ({
//       id: r.id,
//       minPrice: r.tables?.[0]?.pricePerSeat ?? null,
//     }));

//     pairs.sort((a, b) => {
//       if (a.minPrice == null && b.minPrice == null) return 0;
//       if (a.minPrice == null) return 1;
//       if (b.minPrice == null) return -1;
//       return sortOrder === 'asc'
//         ? Number(a.minPrice) - Number(b.minPrice)
//         : Number(b.minPrice) - Number(a.minPrice);
//     });

//     const total = pairs.length;
//     const pageIds = pairs.slice(skip, skip + take).map(p => p.id);

//     if (pageIds.length === 0) {
//       return { data: [], page, pageSize, total, hasMore: false };
//     }

//     const items = await this.prisma.restaurant.findMany({
//       where: { id: { in: pageIds } },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         image: true,
//         rating: true,
//         priceLevel: true,
//         menu: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//         tables: {
//           orderBy: { pricePerSeat: 'asc' },
//           take: 1,
//           select: { pricePerSeat: true },
//         },
//       },
//     });

//     const orderMap = new Map(pageIds.map((id, idx) => [id, idx]));
//     items.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

//     const data = items.map(r => {
//       const loc = r.service?.location;
//       const minSeat = r.tables?.[0]?.pricePerSeat ?? null;
//       return {
//         id: r.id,
//         name: r.name,
//         description: r.description,
//         image: r.image,
//         rating: r.rating,
//         priceLevel: r.priceLevel ?? null,
//         location: loc
//           ? {
//               name: loc.name,
//               country: loc.country,
//               province: loc.province,
//               district: loc.district,
//               address: loc.address,
//               lat: loc.lat,
//               lng: loc.long,
//             }
//           : null,
//         priceMinPerSeat: minSeat,
//         createdAt: r.service?.createdAt ?? null,
//       };
//     });

//     return {
//       data,
//       page,
//       pageSize,
//       total,
//       hasMore: skip + data.length < total,
//     };
//   }

//   // ✅ sort ปกติ
//   let orderBy: any = undefined;
//   switch (q.sortBy) {
//     case 'rating':
//       orderBy = { rating: sortOrder };
//       break;
//     case 'name':
//       orderBy = { name: sortOrder };
//       break;
//     case 'createdAt':
//       orderBy = { service: { createdAt: sortOrder } };
//       break;
//     default:
//       orderBy = undefined;
//   }

//   const [total, items] = await this.prisma.$transaction([
//     this.prisma.restaurant.count({ where }),
//     this.prisma.restaurant.findMany({
//       where,
//       orderBy,
//       skip,
//       take,
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         image: true,
//         rating: true,
//         priceLevel: true,
//         menu: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//         tables: {
//           orderBy: { pricePerSeat: 'asc' },
//           take: 1,
//           select: { pricePerSeat: true },
//         },
//       },
//     }),
//   ]);

//   const data = items.map(r => {
//     const loc = r.service?.location;
//     const minSeat = r.tables?.[0]?.pricePerSeat ?? null;
//     return {
//       id: r.id,
//       name: r.name,
//       description: r.description,
//       image: r.image,
//       rating: r.rating,
//       priceLevel: r.priceLevel ?? null,
//       location: loc
//         ? {
//             name: loc.name,
//             country: loc.country,
//             province: loc.province,
//             district: loc.district,
//             address: loc.address,
//             lat: loc.lat,
//             lng: loc.long,
//           }
//         : null,
//       priceMinPerSeat: minSeat,
//       createdAt: r.service?.createdAt ?? null,
//     };
//   });

//   return {
//     data,
//     page,
//     pageSize,
//     total,
//     hasMore: skip + data.length < total,
//   };
// }


//   /* ------- ATTRACTIONS ------- */
// async searchAttractions(q: SearchQueryDto): Promise<Paginated<any>> {
//   const { page, pageSize, skip, take } = parsePaging(q);

//   // ✅ เตรียมคีย์เวิร์ด + amenities ให้สะอาด
//   const keyword = q.q?.trim();

//   let amenities = q.amenities as string[] | string | undefined;
//   if (typeof amenities === 'string') {
//     amenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
//   }
//   if (!Array.isArray(amenities)) {
//     amenities = [];
//   }

//   const amenityList = Array.from(new Set(amenities));

//   // ✅ WHERE
//   const where: any = {
//     AND: [
//       keyword
//         ? {
//             OR: [
//               { name: { contains: keyword, mode: 'insensitive' } },
//               { description: { contains: keyword, mode: 'insensitive' } },
//               {
//                 location: {
//                   OR: [
//                     { name: { contains: keyword, mode: 'insensitive' } },
//                     { country: { contains: keyword, mode: 'insensitive' } },
//                     { province: { contains: keyword, mode: 'insensitive' } },
//                     { district: { contains: keyword, mode: 'insensitive' } },
//                     { address: { contains: keyword, mode: 'insensitive' } },
//                   ],
//                 },
//               },
//             ],
//           }
//         : {},

//       amenityList.length
//         ? {
//             OR: amenityList.map(kw => ({
//               description: { contains: kw, mode: 'insensitive' },
//             })),
//           }
//         : {},
//     ].filter(Boolean),
//   };

//   // ✅ ORDER BY
//   let orderBy: any = undefined;
//   const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';
//   switch (q.sortBy) {
//     case 'name':
//       orderBy = { name: sortOrder };
//       break;
//     case 'createdAt':
//       orderBy = { location: { createdAt: sortOrder } };
//       break;
//     default:
//       orderBy = undefined;
//   }

//   const [total, items] = await this.prisma.$transaction([
//     this.prisma.place.count({ where }),
//     this.prisma.place.findMany({
//       where,
//       orderBy,
//       skip,
//       take,
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         placeImg: true,
//         location: {
//           select: {
//             name: true,
//             country: true,
//             province: true,
//             district: true,
//             address: true,
//             lat: true,
//             long: true,
//             createdAt: true,
//           },
//         },
//       },
//     }),
//   ]);

//   const data = items.map(p => {
//     const loc = p.location;
//     return {
//       id: p.id,
//       name: p.name,
//       description: p.description,
//       image: p.placeImg ?? null,
//       location: loc
//         ? {
//             name: loc.name,
//             country: loc.country,
//             province: loc.province,
//             district: loc.district,
//             address: loc.address,
//             lat: loc.lat,
//             lng: loc.long,
//             createdAt: loc.createdAt,
//           }
//         : null,
//     };
//   });

//   return {
//     data,
//     page,
//     pageSize,
//     total,
//     hasMore: skip + data.length < total,
//   };
// }


//   /* ------- RENTAL CARS ------- */
// async searchRentals(q: SearchQueryDto): Promise<Paginated<any>> {
//   const { page, pageSize, skip, take } = parsePaging(q);

//   // ✅ ทำความสะอาดคีย์เวิร์ด + amenities
//   const keyword = q.q?.trim();

//   let amenities = q.amenities as string[] | string | undefined;
//   if (typeof amenities === 'string') {
//     amenities = amenities.split(',').map(s => s.trim()).filter(Boolean);
//   }
//   if (!Array.isArray(amenities)) {
//     amenities = [];
//   }

//   const amenityList = Array.from(new Set(amenities));

//   // ✅ WHERE
//   const where: any = {
//     AND: [
//       keyword
//         ? {
//             OR: [
//               { name: { contains: keyword, mode: 'insensitive' } },
//               { description: { contains: keyword, mode: 'insensitive' } },
//               { cars: { some: { model: { contains: keyword, mode: 'insensitive' } } } },
//               {
//                 service: {
//                   location: {
//                     OR: [
//                       { name: { contains: keyword, mode: 'insensitive' } },
//                       { province: { contains: keyword, mode: 'insensitive' } },
//                       { district: { contains: keyword, mode: 'insensitive' } },
//                       { address: { contains: keyword, mode: 'insensitive' } },
//                       { country: { contains: keyword, mode: 'insensitive' } },
//                     ],
//                   },
//                 },
//               },
//             ],
//           }
//         : {},

//       q.priceMin ? { cars: { some: { pricePerDay: { gte: Number(q.priceMin) } } } } : {},
//       q.priceMax ? { cars: { some: { pricePerDay: { lte: Number(q.priceMax) } } } } : {},
//       q.ratingMin ? { rating: { gte: Number(q.ratingMin) } } : {},

//       amenityList.length
//         ? {
//             OR: amenityList.map(kw => ({
//               description: { contains: kw, mode: 'insensitive' },
//             })),
//           }
//         : {},
//     ].filter(Boolean),
//   };

//   const wantsPriceSort = q.sortBy === 'price';
//   const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';

//   if (wantsPriceSort) {
//     const allForSort = await this.prisma.carRentalCenter.findMany({
//       where,
//       select: {
//         id: true,
//         cars: {
//           orderBy: { pricePerDay: 'asc' },
//           take: 1,
//           select: { pricePerDay: true },
//         },
//       },
//     });

//     const pairs = allForSort.map(c => ({
//       id: c.id,
//       minPrice: c.cars?.[0]?.pricePerDay ?? null,
//     }));

//     pairs.sort((a, b) => {
//       if (a.minPrice == null && b.minPrice == null) return 0;
//       if (a.minPrice == null) return 1;
//       if (b.minPrice == null) return -1;
//       return sortOrder === 'asc'
//         ? Number(a.minPrice) - Number(b.minPrice)
//         : Number(b.minPrice) - Number(a.minPrice);
//     });

//     const total = pairs.length;
//     const pageIds = pairs.slice(skip, skip + take).map(p => p.id);

//     if (pageIds.length === 0) {
//       return { data: [], page, pageSize, total, hasMore: false };
//     }

//     const items = await this.prisma.carRentalCenter.findMany({
//       where: { id: { in: pageIds } },
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         image: true,
//         rating: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//         cars: {
//           orderBy: { pricePerDay: 'asc' },
//           take: 1,
//           select: { pricePerDay: true, model: true },
//         },
//       },
//     });

//     const orderMap = new Map(pageIds.map((id, idx) => [id, idx]));
//     items.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

//     const data = items.map(c => {
//       const loc = c.service?.location;
//       const cheapest = c.cars?.[0] || null;
//       return {
//         id: c.id,
//         name: c.name,
//         description: c.description,
//         image: c.image,
//         rating: c.rating,
//         priceMinPerDay: cheapest?.pricePerDay ?? null,
//         cheapestModel: cheapest?.model ?? null,
//         location: loc
//           ? {
//               name: loc.name,
//               country: loc.country,
//               province: loc.province,
//               district: loc.district,
//               address: loc.address,
//               lat: loc.lat,
//               lng: loc.long,
//             }
//           : null,
//         createdAt: c.service?.createdAt ?? null,
//       };
//     });

//     return {
//       data,
//       page,
//       pageSize,
//       total,
//       hasMore: skip + data.length < total,
//     };
//   }

//   // ✅ Prisma ปกติ
//   let orderBy: any = undefined;
//   switch (q.sortBy) {
//     case 'rating':
//       orderBy = { rating: sortOrder };
//       break;
//     case 'name':
//       orderBy = { name: sortOrder };
//       break;
//     case 'createdAt':
//       orderBy = { service: { createdAt: sortOrder } };
//       break;
//     default:
//       orderBy = undefined;
//   }

//   const [total, items] = await this.prisma.$transaction([
//     this.prisma.carRentalCenter.count({ where }),
//     this.prisma.carRentalCenter.findMany({
//       where,
//       orderBy,
//       skip,
//       take,
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         image: true,
//         rating: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//         cars: {
//           orderBy: { pricePerDay: 'asc' },
//           take: 1,
//           select: { pricePerDay: true, model: true },
//         },
//       },
//     }),
//   ]);

//   const data = items.map(c => {
//     const loc = c.service?.location;
//     const cheapest = c.cars?.[0] || null;
//     return {
//       id: c.id,
//       name: c.name,
//       description: c.description,
//       image: c.image,
//       rating: c.rating,
//       priceMinPerDay: cheapest?.pricePerDay ?? null,
//       cheapestModel: cheapest?.model ?? null,
//       location: loc
//         ? {
//             name: loc.name,
//             country: loc.country,
//             province: loc.province,
//             district: loc.district,
//             address: loc.address,
//             lat: loc.lat,
//             lng: loc.long,
//           }
//         : null,
//       createdAt: c.service?.createdAt ?? null,
//     };
//   });

//   return {
//     data,
//     page,
//     pageSize,
//     total,
//     hasMore: skip + data.length < total,
//   };
// }



//   /* ------- GUIDES (ไกด์ท้องถิ่น) ------- */
// async searchGuides(q: SearchQueryDto): Promise<Paginated<any>> { 
//   const { page, pageSize, skip, take } = parsePaging(q);

//   // ✅ 1. ทำความสะอาด amenities ให้เป็น array เสมอ
//   let amenities = q.amenities as string[] | string | undefined;

//   if (typeof amenities === 'string') {
//     amenities = amenities
//       .split(',')
//       .map(s => s.trim())
//       .filter(Boolean); // ✅ ลบค่าว่าง
//   }
//   if (!Array.isArray(amenities)) {
//     amenities = [];
//   }

//   const amenityList = Array.from(
//     new Set(amenities.map(s => s?.trim()).filter(Boolean))
//   );

//   // ✅ 2. ทำความสะอาด keyword
//   const keyword = q.q?.trim();

//   // ✅ 3. ภาษาที่เลือก (any / all)
//   let rawLang = (q as any).language as string | string[] | undefined;
//   if (Array.isArray(rawLang)) {
//     rawLang = rawLang.join(','); // เผื่อ frontend ส่งมาเป็น array
//   }
//   const languageMode: 'any' | 'all' =
//     (q as any).languageMode === 'all' ? 'all' : 'any';

//   const languages = rawLang
//     ? Array.from(new Set(rawLang.split(',').map(s => s.trim()).filter(Boolean)))
//     : [];

//   // ✅ 4. สร้าง where ตามเงื่อนไข
//   const where: any = {
//     AND: [
//       // keyword search
//       keyword
//         ? {
//             OR: [
//               { name: { contains: keyword, mode: 'insensitive' } },
//               { description: { contains: keyword, mode: 'insensitive' } },
//               { language: { contains: keyword, mode: 'insensitive' } },
//               {
//                 service: {
//                   location: {
//                     OR: [
//                       { name: { contains: keyword, mode: 'insensitive' } },
//                       { province: { contains: keyword, mode: 'insensitive' } },
//                       { district: { contains: keyword, mode: 'insensitive' } },
//                       { address: { contains: keyword, mode: 'insensitive' } },
//                       { country: { contains: keyword, mode: 'insensitive' } },
//                     ],
//                   },
//                 },
//               },
//             ],
//           }
//         : {},

//       // language filter
//       languages.length
//         ? languageMode === 'all'
//           ? { AND: languages.map(l => ({ language: { contains: l, mode: 'insensitive' } })) }
//           : { OR: languages.map(l => ({ language: { contains: l, mode: 'insensitive' } })) }
//         : {},

//       // price range
//       q.priceMin ? { pay: { gte: Number(q.priceMin) } } : {},
//       q.priceMax ? { pay: { lte: Number(q.priceMax) } } : {},

//       // rating filter
//       q.ratingMin ? { rating: { gte: Number(q.ratingMin) } } : {},

//       // amenities → search in description
//       amenityList.length
//         ? {
//             OR: amenityList.map(kw => ({
//               description: { contains: kw, mode: 'insensitive' },
//             })),
//           }
//         : {},
//     ].filter(Boolean),
//   };

//   // ✅ 5. Sorting
//   let orderBy: any = undefined;
//   const sortOrder: 'asc' | 'desc' = (q.sortOrder as any) || 'asc';
//   switch (q.sortBy) {
//     case 'price':
//       orderBy = { pay: sortOrder };
//       break;
//     case 'rating':
//       orderBy = { rating: sortOrder };
//       break;
//     case 'name':
//       orderBy = { name: sortOrder };
//       break;
//     case 'createdAt':
//       orderBy = { service: { createdAt: sortOrder } };
//       break;
//     default:
//       orderBy = undefined;
//   }

//   // ✅ 6. Prisma query
//   const [total, items] = await this.prisma.$transaction([
//     this.prisma.guide.count({ where }),
//     this.prisma.guide.findMany({
//       where,
//       orderBy,
//       skip,
//       take,
//       select: {
//         id: true,
//         name: true,
//         description: true,
//         image: true,
//         rating: true,
//         pay: true,
//         languages: true,
//         service: {
//           select: {
//             createdAt: true,
//             location: {
//               select: {
//                 name: true,
//                 country: true,
//                 province: true,
//                 district: true,
//                 address: true,
//                 lat: true,
//                 long: true,
//               },
//             },
//           },
//         },
//       },
//     }),
//   ]);

//   // ✅ 7. แปลงข้อมูลให้อยู่ในรูปที่ frontend ใช้งานได้ง่าย
//   const data = items.map(g => {
//     const loc = g.service?.location;
//     return {
//       id: g.id,
//       name: g.name,
//       description: g.description,
//       image: g.image,
//       rating: g.rating,
//       pay: g.pay,
//       language: g.languages,
//       location: loc
//         ? {
//             name: loc.name,
//             country: loc.country,
//             province: loc.province,
//             district: loc.district,
//             address: loc.address,
//             lat: loc.lat,
//             lng: loc.long,
//           }
//         : null,
//       createdAt: g.service?.createdAt ?? null,
//     };
//   });

//   return {
//     data,
//     page,
//     pageSize,
//     total,
//     hasMore: skip + data.length < total,
//   };
// }

// }