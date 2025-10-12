import { Controller, Get, Post, Body, Patch, Param, Delete , UseInterceptors, UploadedFile } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @UseInterceptors(FileInterceptor('groupImg'))
  create(@Body() createGroupDto: CreateGroupDto,
    @UploadedFile() profileImg?: Express.Multer.File){
    return this.groupService.create(createGroupDto, profileImg);
  }

  @Get()             
  findAll() {
    return this.groupService.findAll();
  }

  @Post('/:groupId/join')
  joinGroup(@Body() body: { userId: string}, @Param('groupId') groupId: string) {
    const { userId} = body;

    return this.groupService.joinGroup(userId, groupId);
  }
  @Delete('/:groupId/leave')
  leaveGroup(@Body() body: { userId: string}, @Param('groupId') groupId: string) {
    const { userId} = body;

    return this.groupService.leaveGroup(userId, groupId);
  }


  @Get('/shearch/:text')
  shearchGroup(@Param('text') text: string) {
    return this.groupService.shearchGroup(text);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }
}
