import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenDto {
  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'access_token',
  })
  access_token: string;
}
