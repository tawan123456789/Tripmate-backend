import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import { MinioService } from '../minio/minio.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {CreateUserDto} from '../users/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly minioService: MinioService
  ) {}
  
  async register(createUserDto: CreateUserDto, profileImg?: Express.Multer.File) {
    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    if (profileImg) {
      const fileName = `${uuidv4()}${profileImg.originalname.substring(profileImg.originalname.lastIndexOf('.'))}`;
      const url = await this.minioService.uploadAvatar(profileImg.buffer, fileName, profileImg.mimetype);
      createUserDto.profileImg = url;
    }

    // Ensure username exists (DB requires unique username). If not provided, fall back to email or a generated id.
    if (!createUserDto.username || createUserDto.username.trim() === '') {
      createUserDto.username = createUserDto.email || `user_${uuidv4()}`;
    }

    await this.usersService.create(createUserDto);

    const user = await this.usersService.findByUsername(createUserDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid user or password');
    }
    const payload = { sub: user.id, username: user.email ,userRole: user.role};
    const access_token = this.jwtService.sign(payload);
    return { message: 'Register Success', access_token: access_token };
  }

  async login(loginDto: LoginDto) {
    console.log("Login DTO:", loginDto.username);
    const user = await this.usersService.findByUsername(loginDto.username);
      if (!user) {
        throw new UnauthorizedException('Invalid user or password');
      }
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid user or password');
    }
    const payload = { sub: user.id, username: user.email,userRole: user.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token: access_token };
  }
}
