export class CreateCarDto {
    id: string;
    crcId: string;
    pricePerDay?: number
    model?: string;
    description?: string
    carseat?: number;
    image?: string
}
// model Car {
//   id           String     @id @map("car_id")
//   crcId        String    @map("crc_id")
//   pricePerDay  Decimal? @db.Decimal(10,2) @map("price_per_day")
//   model        String?
//   description  String?
//   carseat      Int?
//   image        String?
//   status       String?
//   createdAt    DateTime  @default(now()) @map("created_at")
//   updatedAt    DateTime? @updatedAt     @map("updated_at")
//   deletedAt    DateTime?               @map("deleted_at")

//   center CarRentalCenter @relation(fields: [crcId], references: [id], onDelete: Cascade)

//   @@index([crcId])
//   @@map("Car")
// }