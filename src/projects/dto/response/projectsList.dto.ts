import { ApiProperty } from '@nestjs/swagger';
import { ProjectItem } from 'src/projects/dto/response/projectItem.dto';

export class ProjectsListDto {
  @ApiProperty({ description: '전체 페이지 수' })
  total_page: number;

  @ApiProperty({ description: '전체 프로젝트 수' })
  total_amount: number;

  @ApiProperty({ description: '프로젝트 목록', type: [ProjectItem] })
  projects: Array<ProjectItem>;
}
