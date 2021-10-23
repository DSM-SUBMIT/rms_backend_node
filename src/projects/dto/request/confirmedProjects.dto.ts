import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min } from 'class-validator';

export class ConfirmedProjectsDto {
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

  @ApiPropertyOptional({
    description: '검색할 분야(띄어쓰기 없이)',
    example: 'WEB,APP',
    type: 'string',
  })
  @IsOptional()
  @IsEnum(['WEB', 'APP', 'GAME', 'EMBEDDED', 'AI_BIGDATA', 'SECURITY'], {
    each: true,
  })
  @Type(() => String)
  @Transform(({ value }: { value: string }) => value.split(','))
  field?: string[];
}
