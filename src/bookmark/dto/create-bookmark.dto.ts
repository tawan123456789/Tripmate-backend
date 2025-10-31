import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class CreateBookmarkDto {
    @IsString()
    @ApiProperty()
    serviceId: string;

    @IsString()
    @ApiProperty()
    userId: string;

    @IsOptional()
    @IsString()
    status?: string;
}


// model Bookmark {
//   id        String         @id @map("bookmark_id")
//   serviceId String         @map("service_id")
//   userId    String      @db.Uuid  @map("user_id")
//   createdAt DateTime    @default(now()) @map("created_at")
//   updatedAt DateTime?   @updatedAt     @map("updated_at")
//   status    String?

//   service   UserService @relation(fields: [serviceId], references: [id], onDelete: Cascade)
//   user      User        @relation(fields: [userId],    references: [id], onDelete: Cascade)

//   @@index([serviceId])
//   @@index([userId])
//   @@map("Bookmark")
// }