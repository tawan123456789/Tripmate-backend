import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello() {
    return this.appService.getHello();
  }

  @Get('/health')
  async health() {
    return this.appService.health();  // รวมทั้งเช็ค DB
  }

  @Get('/health/db')
  async dbHealth() {
    return this.appService.dbHealth(); // เช็ค DB ตรงๆ
  }
}
