import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsString, Min, MinLength } from 'class-validator';

export class SearchProjectsDto {
  @ApiProperty({
    description: '검색할 프로젝트 제목',
  })
  @IsString()
  @MinLength(1)
  query: string;

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
