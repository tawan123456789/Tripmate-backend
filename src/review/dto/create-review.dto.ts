export class CreateReviewDto {
    id: string;
    serviceId: string;
    userId: string
    comment?: string;
    score?: number
    image?: string
    status?: string
}

// model Review {
//   id        String         @id @map("review_id")
//   serviceId String         @map("service_id")
//   userId    String         @db.Uuid @map("user_id")
//   comment   String?
//   score     Int?
//   createdAt DateTime    @default(now()) @map("created_at")
//   updatedAt DateTime?   @updatedAt     @map("updated_at")
//   status    String?
//   image       String?


//   service   UserService @relation(fields: [serviceId], references: [id], onDelete: Cascade)
//   user      User        @relation(fields: [userId],    references: [id], onDelete: Cascade)

//   @@index([serviceId])
//   @@index([userId])
//   @@map("Review")
// }
