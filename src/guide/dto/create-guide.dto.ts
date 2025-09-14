export class CreateGuideDto {
    id: string;
    name: string
    description?: string;
    image?: string;
    rating?: number;
}

// model Guide {
//   id          String        @id @map("guide_id")
//   name        String
//   description String?
//   image      String?
//   rating      Decimal? @db.Decimal(2,1)
//   service     UserService @relation(fields: [id],     references: [id], onDelete: Cascade)
//   @@map("Guide")
// }

