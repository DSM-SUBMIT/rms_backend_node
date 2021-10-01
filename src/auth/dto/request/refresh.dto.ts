import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshDto {
  @ApiProperty({
    description: '리프레시 토큰',
    example: 'refresh_token',
  })
  @IsString()
  refresh_token: string;
}
