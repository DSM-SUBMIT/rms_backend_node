import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, Min } from 'class-validator';

export class PendingProjectsDto {
  @ApiProperty({
    description: '종류(계획서 / 보고서)',
    enum: ['plan', 'report'],
  })
  @IsEnum(['plan', 'report'])
  type: string;

  @ApiProperty({
    description: '한 페이지에 담길 프로젝트 개수',
    minimum: 1,
    default: 8,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit: number;

  @ApiProperty({
    description: '페이지 번호',
    minimum: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page: number;
}
