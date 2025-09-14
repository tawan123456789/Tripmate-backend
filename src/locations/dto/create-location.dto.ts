import { IsEmail, IsOptional, IsString, IsDateString, MinLength, IsLatitude, IsLongitude } from 'class-validator';
export class CreateLocationDto {
    
    @IsOptional() @IsString() id: string; // ถ้าไม่ส่งจะ gen อัตโนมัติ

    @IsLatitude() lat: string;
    @IsLongitude() long: string;
    @IsString() name: string;
    @IsOptional() @IsString() detail?: string;
    @IsOptional() @IsString() status?: string;

    @IsOptional() @IsString() country?: string
    @IsOptional() @IsString() province?: string
    @IsOptional() @IsString() address?: string
    @IsOptional() @IsString() district?: string
    @IsOptional() @IsString() street?: string
    @IsOptional() @IsString() zipCode?: string

}


// model Location {
//   id       String      @map("location_id")
//   lat      Float
//   long     Float
//   name     String
//   detail   String?
//   status   String?
//   createdAt DateTime  @default(now()) @map("created_at")
//   updatedAt DateTime? @updatedAt     @map("updated_at")
//   deletedAt DateTime?               @map("deleted_at")

//   country  String?
//   province String?
//   address  String?
//   district String?
//   street   String?
//   zipCode  String?   @map("zip_code")


//   servicesByLoc    UserService[]  @relation("ServiceLoc")

//   places   Place[]

//   @@map("Location")
// }