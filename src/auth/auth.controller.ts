import {
  Body,
  Controller,
  HttpCode,
  Patch,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Roles } from '../utils/decorators/roles.decorator';
import { ChangePwDto } from './dto/request/changePw.dto';
import { LoginDto } from './dto/request/login.dto';
import { Role } from '../utils/enums/role.enum';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AccessTokenDto } from './dto/response/accessToken.dto';
import { RefreshDto } from './dto/request/refresh.dto';

@Controller({ host: 'admin-api.dsm-rms.com', path: 'auth' })
@ApiTags('인증 API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @ApiOperation({ summary: '어드민 토큰 발급 요청(로그인)' })
  @ApiCreatedResponse({
    description: '요청이 성공하여 새로운 토큰이 발급됨',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({
    description: '유저를 찾을 수 없음 / 비밀번호가 다름',
  })
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload);
  }

  @Patch('password')
  @HttpCode(204)
  @Roles(Role.Admin)
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '어드민 비밀번호 변경' })
  @ApiBearerAuth()
  @ApiNoContentResponse({
    description:
      '요청이 성공적으로 완료되었으며, 추가적인 내용이 존재하지 않음',
  })
  @ApiUnauthorizedResponse({ description: '기존 비밀번호가 올바르지 않음' })
  @ApiConflictResponse({ description: '현재 비밀번호와 새 비밀번호가 동일함' })
  changePw(@Request() req, @Body() payload: ChangePwDto) {
    return this.authService.changePw(req.user.userId, payload);
  }

  @Put('refresh')
  @HttpCode(201)
  @ApiOperation({
    summary: '토큰 재발급',
    description: '## (참고) 새 토큰 발급 시 기존 리프레시 토큰은 사용 불가',
  })
  @ApiBearerAuth()
  @ApiCreatedResponse({
    description: '요청이 성공하여 새로운 토큰이 발급됨',
    type: AccessTokenDto,
  })
  @ApiUnauthorizedResponse({ description: '유효하지 않은 토큰' })
  refresh(@Body() payload: RefreshDto) {
    return this.authService.refresh(payload.refresh_token);
  }
}
