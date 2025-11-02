import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateReviewDto {

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    serviceId?: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    placeId?: string;

    @ApiPropertyOptional()
    @IsString()
    userId: string;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    comment?: string;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    score1?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    score2?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    score3?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    score4?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    score5?: number;

    @ApiPropertyOptional()
    @IsNumber()
    @IsOptional()
    score6?: number;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
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