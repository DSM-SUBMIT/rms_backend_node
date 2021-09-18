import { ApiProperty, PickType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { LoginDto } from './login.dto';

export class ChangePwDto {
  @ApiProperty({ description: '기존 비밀번호', example: 'testpw' })
  @IsString()
  oldPassword: string;

  @ApiProperty({ description: '새 비밀번호', example: 'testpw1234!#' })
  @IsString()
  newPassword: string;
}
