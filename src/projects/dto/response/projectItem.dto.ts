import { ApiProperty } from '@nestjs/swagger';

export class ProjectItem {
  @ApiProperty({ description: '프로젝트 ID' })
  id: number;

  @ApiProperty({ description: '프로젝트 종류' })
  project_type: string;

  @ApiProperty({ description: '개인 프로젝트 여부' })
  is_individual: boolean;

  @ApiProperty({ description: '프로젝트 제목' })
  title: string;

  @ApiProperty({ description: '팀명' })
  team_name: string;

  @ApiProperty({ description: '프로젝트 분야' })
  fields: string[];
}
