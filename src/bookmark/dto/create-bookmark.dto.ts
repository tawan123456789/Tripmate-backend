import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import e from 'express';

export class CreateBookmarkDto {
    @IsString()
    @ApiProperty()
    serviceId: string;

    @IsString()
    @ApiProperty()
    userId: string;

    @IsOptional()
    @ApiPropertyOptional()
    @IsString()
    status?: string;
}

const exampleBookmark = {
    'Place Bookmark': {
        value: {
            serviceId: 's1234567-89ab-cdef-0123-456789abcdef',
            userId: 'u1234567-89ab-cdef-0123-456789abcdef',
            status: 'place'
        }
    },
    'Trip Bookmark': {
        value: {
            serviceId: 's9876543-21fe-dcba-0987-654321fedcba',
            userId: 'u9876543-21fe-dcba-0987-654321fedcba',
            status: 'trip'
        }
    },
    'Service Bookmark': {
        value: {
            serviceId: 's1122334-5566-7788-99aa-bbccddeeff00',
            userId: 'u1122334-5566-7788-99aa-bbccddeeff00',
            status: 'service'
        }
    }
};

export { exampleBookmark };
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