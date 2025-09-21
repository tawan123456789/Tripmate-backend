import { Injectable, UnauthorizedException } from '@nestjs/common';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import {CreateUserDto} from '../users/dto/create-user.dto';
import { create } from 'domain';


@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService
           , private readonly jwtService: JwtService
  ) {}
  
  async register(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);
    await this.usersService.create(createUserDto);

    const user = await this.usersService.findByUsername(createUserDto.email);
    if (!user) {
        throw new UnauthorizedException('Invalid user or password');
    }
    const payload = { sub: user.id, username: user.email };
    const access_token = this.jwtService.sign(payload);
    return { message: 'Register Success', access_token: access_token };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByUsername(loginDto.username);
      if (!user) {
        throw new UnauthorizedException('Invalid user or password');
      }
      const isMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid user or password');
    }
    const payload = { sub: user.id, username: user.email };
    const access_token = this.jwtService.sign(payload);
    return { access_token: access_token };
  }
}
