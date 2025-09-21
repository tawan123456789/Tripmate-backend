export class CreateTableDto {
    id: string;
    restaurantId: string;
    model?: string;
    description?: string;
    seat?: number;
    pricePerSeat?: number;
}
// model Table {
//   id           String     @map("table_id")
//   restaurantId String     @map("restaurant_id")
//   model        String?
//   description  String?
//   seat         Int?
//   pricePerSeat Decimal? @db.Decimal(10,2) @map("price_per_seat")
//   status       String?
//   createdAt    DateTime  @default(now()) @map("created_at")
//   updatedAt    DateTime? @updatedAt     @map("updated_at")
//   deletedAt    DateTime?               @map("deleted_at")



//   restaurant Restaurant @relation(fields: [restaurantId], references: [id], onDelete: Cascade)

//   @@index([restaurantId])
//   @@id([id, restaurantId])
//   @@map("Table")
// }