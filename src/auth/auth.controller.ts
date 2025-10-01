import { Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {CreateUserDto} from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService
    
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profileImg'))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profileImg?: Express.Multer.File
  ) {
    return this.authService.register(createUserDto, profileImg);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
