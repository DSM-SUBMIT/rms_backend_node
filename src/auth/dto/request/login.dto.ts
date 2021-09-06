import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: '어드민 계정의 아이디',
    example: 'testid',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: '어드민 계정의 비밀번호',
    example: 'testpw1234!#',
  })
  @IsString()
  password: string;
}
