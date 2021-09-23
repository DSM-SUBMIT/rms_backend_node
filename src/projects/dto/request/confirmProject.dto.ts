import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export class ConfirmProjectDto {
  @ApiProperty({
    description: '승인/거절 여부(approve / deny)',
    enum: ['approve', 'deny'],
  })
  @IsEnum(['approve', 'deny'])
  type: string;

  @ApiProperty({ description: '승인/거절 코멘트' })
  @IsString()
  comment: string;
}
