import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'access_token',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT 리프레시 토큰',
    example: 'refresh_token',
  })
  refresh_token: string;
}
