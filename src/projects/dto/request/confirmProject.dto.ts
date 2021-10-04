import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsString } from 'class-validator';

export class ConfirmProjectBodyDto {
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

export class ConfirmProjectParamDto {
  @ApiProperty({
    description: '프로젝트 ID',
  })
  @IsNumber()
  @Type(() => Number)
  projectId: number;

  @ApiProperty({
    description: '종류(계획서 / 보고서)',
    enum: ['plan', 'report'],
  })
  @IsEnum(['plan', 'report'])
  type: string;
}
