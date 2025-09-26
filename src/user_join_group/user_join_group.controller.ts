import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserJoinGroupService } from './user_join_group.service';
import { CreateUserJoinGroupDto } from './dto/create-user_join_group.dto';
import { UpdateUserJoinGroupDto } from './dto/update-user_join_group.dto';

@Controller('user-join-group')
export class UserJoinGroupController {
  constructor(private readonly userJoinGroupService: UserJoinGroupService) {}

  @Post()
  create(@Body() createUserJoinGroupDto: CreateUserJoinGroupDto) {
    return this.userJoinGroupService.create(createUserJoinGroupDto);
  }

  @Get()
  findAll() {
    return this.userJoinGroupService.findAll();
  }

  @Get(':user_id/:group_id')
  findOne(@Param('user_id') user_id: string, @Param('group_id') group_id: string) {
    return this.userJoinGroupService.findOne(user_id, group_id);
  }

  @Patch(':user_id/:group_id')
  update(@Param('user_id') user_id: string, @Param('group_id') group_id: string, @Body() updateUserJoinGroupDto: UpdateUserJoinGroupDto) {
    return this.userJoinGroupService.update(user_id, group_id, updateUserJoinGroupDto);
  }

  @Delete(':user_id/:group_id')
  remove(@Param('user_id') user_id: string, @Param('group_id') group_id: string) {
    return this.userJoinGroupService.remove(user_id, group_id);
  }
}
