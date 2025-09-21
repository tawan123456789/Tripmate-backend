export class CreateRestaurantDto {
    id: string;
    name: string;
    description?: string;
    menu?: string
    image?: string;
    
}

// model Restaurant {
//   id          String         @id @map("restaurant_id")
//   name        String
//   description String?
//   menu       String?    @map("menu")
//   image      String?
//   rating      Decimal? @db.Decimal(2,1)
//   service     UserService @relation(fields: [id],     references: [id], onDelete: Cascade)
//   tables      Table[]


//   @@map("Restaurant")
// }
