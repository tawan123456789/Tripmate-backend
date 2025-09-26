export class CreateTripPlanDto {
    id: string;
    ownerId: string;
    tripName: string;
    tripImg?: string;
    status?: string;
    note?: string;
    startDate?: Date;
    endDate?: Date;
}

    



// model TripPlan {
//   id         String        @id @map("trip_id")
//   ownerId    String     @db.Uuid   @map("owner_id")
//   createAt   DateTime   @default(now())               @map("create_at")
//   updateAt   DateTime?  @updatedAt                   @map("update_at")
//   deleteAt   DateTime?                                 @map("delete_at")
//   tripName   String     @map("trip_name")
//   tripImg    String?    @map("trip_img")
//   status     String?
//   note       String?
//   startDate  DateTime?  @db.Date                     @map("start_date")
//   endDate    DateTime?  @db.Date                     @map("end_date")

//   owner      User       @relation("TripPlanOwner", fields: [ownerId], references: [id])
//   units      TripUnit[]
//   groups     Group[]


//   @@index([ownerId])
//   @@map("TripPlan")
// }
