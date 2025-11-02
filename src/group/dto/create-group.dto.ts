import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGroupDto {
    @ApiProperty({ description: 'Owner user id' })
    @IsString()
    ownerId: string;

    @ApiProperty({ description: 'Group name' })
    @IsString()
    groupName: string;

    // This field is handled as a file upload in the controller (multipart/form-data).
    // Keep a string field for potential URL when creating programmatically.
    @ApiPropertyOptional({ description: 'Group image URL (or upload as form file)', type: 'string', format: 'binary' })
    @IsOptional()
    @IsString()
    groupImg?: string;

    @ApiPropertyOptional({ description: 'Description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ description: 'Status' })
    @IsOptional()
    @IsString()
    status?: string;
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