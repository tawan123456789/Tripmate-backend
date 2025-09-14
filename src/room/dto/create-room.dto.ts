export class CreateRoomDto {
    id: string;
    hotelId: string;
    pricePerNight?: number;
    bedType?: string;
    personPerRoom?: number;
    description?: string;
    image?: string;
}


// model Room {
//   id             String     @id @map("room_id")
//   hotelId        String     @map("hotel_id")
//   pricePerNight  Decimal? @db.Decimal(10,2) @map("price_per_night")
//   bedType        String?  @map("bed_type")
//   personPerRoom  Int?     @map("person_per_room")
//   description    String?
//   image          String?

//   hotel  Hotel @relation(fields: [hotelId], references: [id], onDelete: Cascade)

//   @@index([hotelId])
//   @@map("Room")
// }