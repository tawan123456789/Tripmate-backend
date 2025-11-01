import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class CreateReviewDto {

    @ApiPropertyOptional()
    @IsString()
    serviceId?: string;

    @ApiPropertyOptional()
    @IsString()
    placeId?: string;

    @ApiPropertyOptional()
    @IsString()
    userId: string;

    @ApiPropertyOptional()
    @IsString()
    comment?: string;

    @ApiPropertyOptional()
    @IsNumber()
    score1?: number;

    @ApiPropertyOptional()
    @IsNumber()
    score2?: number;

    @ApiPropertyOptional()
    @IsNumber()
    score3?: number;

    @ApiPropertyOptional()
    @IsNumber()
    score4?: number;

    @ApiPropertyOptional()
    @IsNumber()
    score5?: number;

    @ApiPropertyOptional()
    @IsNumber()
    score6?: number;

    @ApiPropertyOptional()
    @IsString()
    status?: string;
 

}

// model Review {
//   id        String      @id @map("review_id")
//   serviceId String?      @map("service_id")
//   placeId   String?      @map("location_id")
//   userId    String      @map("user_id") @db.Uuid
//   comment   String?
//   score1     Int?
//   score2     Int?
//   score3     Int?
//   score4     Int?
//   score5     Int?
//   score6     Int?
//   createdAt DateTime    @default(now()) @map("created_at")
//   updatedAt DateTime?   @updatedAt @map("updated_at")
//   status    String?
//   image     String[]   @default([])
//   place     Place?   @relation(fields: [placeId], references: [id])
//   service   UserService? @relation(fields: [serviceId], references: [id], onDelete: Cascade)
//   user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)

//   @@index([serviceId])
//   @@index([userId])
//   @@map("Review")
// }