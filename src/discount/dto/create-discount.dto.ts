export class CreateDiscountDto {
    id: string;
    ownerId: string
    value?: number;
    type?: string
    expiredAt?: Date;
    maker_id?: string;
}

// model Discount {
//   id       String      @id @map("discount_id")
//   ownerId  String   @db.Uuid   @map("owner_id")
//   value    Decimal? @db.Decimal(10,2)
//   type     String?
//   status   String?
//   createdAt DateTime  @default(now()) @map("created_at")
//   expiredAt DateTime?               @map("expired_at")
//   maker_id String?   @db.Uuid @map("maker_id")

//   owner    User     @relation("DiscountOwner", fields: [ownerId], references: [id])
//   maker   User?    @relation("DiscountMaker", fields: [maker_id], references: [id])
//   @@index([ownerId])
//   @@map("Discount")
// }

