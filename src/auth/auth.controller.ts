import { Controller, Post, Body, Req, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {CreateUserDto} from '../users/dto/create-user.dto';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RegisterWithFileDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService
    
  ) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profileImg'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: RegisterWithFileDto })
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() profileImg?: Express.Multer.File
  ) {
    return this.authService.register(createUserDto, profileImg);
  }

  @Post('login')
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
