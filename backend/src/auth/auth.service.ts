import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { AuthenticatedUser, LoginResponse, JwtPayload } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(loginDto: LoginDto): Promise<AuthenticatedUser> {
    const user = await this.usersService.findByAccount(loginDto.account);

    if (!user) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('帳號或密碼錯誤');
    }

    return this.usersService.findOne(user.id);
  }

  async login(user: AuthenticatedUser): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      account: user.account,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        account: user.account,
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const user = await this.usersService.create(registerDto);

    return this.login(user);
  }
}
