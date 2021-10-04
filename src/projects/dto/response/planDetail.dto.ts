import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class Members {
  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '역할' })
  role: string;
}

class Includes {
  @ApiProperty({ description: '결과물 - 보고서 포함 여부' })
  result_report: boolean;

  @ApiProperty({ description: '결과물 - 코드 포함 여부' })
  code: boolean;

  @ApiProperty({ description: '결과물 - 실행물(영상, 사진 등) 포함 여부' })
  outcome: boolean;

  @ApiProperty({ description: '결과물 - 기타 포함 여부' })
  others: boolean;

  @ApiPropertyOptional({
    description: '결과물 - 기타 내용(others 항목이 false일 경우 제공되지 않음)',
  })
  others_content: string;
}

class PlanDetail {
  @ApiProperty({ description: '프로젝트 목표' })
  goal: string;

  @ApiProperty({ description: '프로젝트 계획서 본문' })
  content: string;

  @ApiProperty({ description: '프로젝트 시작 예정일' })
  start_date: string;

  @ApiProperty({ description: '프로젝트 완료 예정일' })
  end_date: string;

  @ApiProperty({ description: '프로젝트 결과물 선택', type: Includes })
  includes: Includes;
}

export class PlanDetailDto {
  @ApiProperty({ description: '프로젝트명' })
  project_name: string;
  @ApiProperty({ description: '작성자명' })
  writer: string;
  @ApiProperty({ description: '프로젝트 인원 목록', type: [Members] })
  members: Members[];
  @ApiProperty({ description: '분야' })
  fields: string[];

  @ApiProperty({ description: '계획서 상세', type: PlanDetail })
  plan: PlanDetail;
}
