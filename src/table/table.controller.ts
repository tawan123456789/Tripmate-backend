import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Controller('table')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  create(@Body() createTableDto: CreateTableDto) {
    return this.tableService.create(createTableDto);
  }

  @Get()
  findAll() {
    return this.tableService.findAll();
  }

  @Get(':id/:restaurantId')
  findOne(@Param('id') id:string, @Param('restaurantId') restaurantId:string) {
    return this.tableService.findOne(id,restaurantId);
  }

  @Patch(':id/:restaurantId')
  update(@Param('id') id: string, @Param('restaurantId') restaurantId:string, @Body() updateTableDto: UpdateTableDto) {
    return this.tableService.update(id,restaurantId, updateTableDto);
  }

  @Delete(':id/:restaurantId')
  remove(@Param('id') id: string, @Param('restaurantId') restaurantId:string) {
    return this.tableService.remove(id,restaurantId);
  }
}
