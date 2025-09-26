export class CreatePlanUnitDto {
    id: string;
    tripId: string;
    placeId: string;
    timeStampStart: Date;
    duration?: number;
    status?: string;
    note?: string;
}
// model TripUnit {
//   id             String       @id @map("unit_id")
//   tripId         String       @map("trip_id")
//   placeId        String      @map("place_id")
//   timeStampStart DateTime  @map("time_stamp_start")
//   duration       Int?
//   status         String?
//   note           String?
//   createdAt      DateTime  @default(now()) @map("created_at")
//   updatedAt      DateTime? @updatedAt     @map("updated_at")
//   deletedAt      DateTime?               @map("deleted_at")

//   trip   TripPlan @relation(fields: [tripId], references: [id], onDelete: Cascade)
//   place  Place    @relation(fields: [placeId], references: [id])

//   @@index([tripId])
//   @@index([placeId])
//   @@map("TripUnit")
// }