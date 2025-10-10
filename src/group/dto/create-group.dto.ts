export class CreateGroupDto {
    ownerId: string
    groupName: string;
    groupImg?: string
    description?: string
    status?: string
}


// model Group {
//   id        String            @id  @map("group_id")
//   ownerId   String            @db.Uuid @map("owner_id")
//   owner     User             @relation("GroupOwner", fields: [ownerId], references: [id])
//   groupName String           @map("group_name")
//   groupImg  String?          @map("group_img")
//   status    String?
//   createdAt DateTime         @default(now()) @map("created_at")
//   updatedAt DateTime?        @updatedAt     @map("updated_at")
//   tripPlansId String?        @map("trip_plans_id")

//   // back-relations
//   members   UserJoinGroup[]
//   bookings  Booking[]
//   tripPlans TripPlan? @relation(fields: [tripPlansId], references: [id])

//   @@index([ownerId])
//   @@map("Group")
// }