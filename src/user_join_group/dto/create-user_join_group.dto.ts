export class CreateUserJoinGroupDto {
    groupId: string;
    userId: string
    status?: string
    joinDate?: Date;
}


// model UserJoinGroup {
//   groupId String @map("group_id")
//   userId  String @db.Uuid @map("user_id")
//   status  String?
//   joinDate DateTime @default(now()) @map("join_date")
  

//   group   Group @relation(fields: [groupId], references: [id], onDelete: Cascade)
//   user    User  @relation(fields: [userId],  references: [id], onDelete: Cascade)

//   @@id([groupId, userId])
//   @@map("UserJoinGroup")
// }
