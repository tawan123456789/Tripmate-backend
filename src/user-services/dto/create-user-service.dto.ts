export class CreateUserServiceDto {
    id: string;
    ownerId: string;
    locationId?: string;
    name: string
    description?: string;
    serviceImg?: string;
    status?: string;
    type?: string;

}
//   id                String       @id @map("service_id")
//   ownerId           String    @db.Uuid   @map("owner_id")
//   locationId        String?      @map("location_id")
//   name              String
//   description       String?
//   serviceImg        String?   @map("service_img")
//   status            String?
//   createdAt         DateTime  @default(now()) @map("created_at")
//   updatedAt         DateTime? @updatedAt     @map("updated_at")
//   deletedAt         DateTime?               @map("deleted_at")
//   type              String?