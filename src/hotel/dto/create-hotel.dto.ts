export class CreateHotelDto {}

// model Hotel {
//   id          String         @id @map("hotel_id")
//   name        String
//   description String?
//   facility    String?
//   rating      Decimal? @db.Decimal(2,1)
//   image      String?
//   service     UserService  @relation(fields: [id], references: [id], onDelete: Cascade)

//   rooms       Room[]
//   @@map("Hotel")
// }