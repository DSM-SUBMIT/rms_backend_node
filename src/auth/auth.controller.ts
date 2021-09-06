import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/request/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: '어드민 토큰 발급 요청(로그인)' })
  @ApiCreatedResponse({ description: '요청이 성공하여 새로운 토큰이 발급됨' })
  @ApiUnauthorizedResponse({
    description: '유저를 찾을 수 없음 / 비밀번호가 다름',
  })
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }
}
