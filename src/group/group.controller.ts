import { Controller, Get, Post, Body, Patch, Param, Delete , UseInterceptors, UploadedFile } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateExpenseGroupDto } from '../expense/dto/create-expense-group.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UpdateGroupUserPaymentDto } from './dto/update-group-user-payment.dto';
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

  @Get(':id/details')
  groupDetails(@Param('id') id: string) {
    return this.groupService.groupDetails(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupService.update(id, updateGroupDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupService.remove(id);
  }

  @Post('/expense-group/create')
  createExpenseGroup(@Body() createExpenseGroupDto: CreateExpenseGroupDto) {
    return this.groupService.createExpenseGroup(createExpenseGroupDto);
  }

  @Get('/:groupId/expense-groups')
  getExpenseGroups(@Param('groupId') groupId: string) {
    return this.groupService.getExpenseGroups(groupId);
  }

  @Get('/:groupId/expense-summary')
  getExpenseSummary(@Param('groupId') groupId: string) {
    return this.groupService.getExpenseSummary(groupId);
  }


  @Get('/:groupId/payments')
  getGroupPayments(@Param('groupId') groupId: string) {
    return this.groupService.getGroupPayments(groupId);
  }

  @Patch('/:paymentId/payments')
  updateGroupPayments(@Param('paymentId') paymentId: string, @Body() updateGroupUserPaymentDto: UpdateGroupUserPaymentDto) {
    return this.groupService.updateGroupPayments(paymentId, updateGroupUserPaymentDto);
  }

  @Delete('/:groupId/expense-groups/:expenseGroupId')
  deleteExpenseGroup(@Param('groupId') groupId: string, @Param('expenseGroupId') expenseGroupId: string) {
    return this.groupService.deleteExpenseGroup(groupId, expenseGroupId);
  }


}