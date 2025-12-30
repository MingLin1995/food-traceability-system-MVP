import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiOkResponseGeneric, ApiCreatedResponseGeneric } from '../common/decorators/api-ok-response-generic.decorator';
import { AuthService } from './auth.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto/auth.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Public()
  @Post('register')
  @ApiOperation({ summary: '註冊' })
  @ApiBody({ type: RegisterDto })
  @ApiCreatedResponseGeneric(AuthResponseDto)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '登入' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponseGeneric(AuthResponseDto)
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto);
    return this.authService.login(user);
  }
}
