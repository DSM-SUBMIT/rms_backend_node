import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class ProjectDetailDto {
  @ApiProperty({ description: '프로젝트 아이디', example: 1, minimum: 1 })
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  projectId: number;
}
