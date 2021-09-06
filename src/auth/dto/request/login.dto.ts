import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '어드민 계정의 아이디',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '어드민 계정의 비밀번호',
  })
  @IsString()
  password: string;
}
