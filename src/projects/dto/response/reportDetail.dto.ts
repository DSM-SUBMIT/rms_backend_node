import { ApiProperty } from '@nestjs/swagger';

class Members {
  @ApiProperty({ description: '이름' })
  name: string;

  @ApiProperty({ description: '역할' })
  role: string;
}

class ReportDetail {
  @ApiProperty({ description: '프로젝트 보고서 본문' })
  content: string;
}

export class ReportDetailDto {
  @ApiProperty({ description: '프로젝트명' })
  project_name: string;
  @ApiProperty({ description: '작성자명' })
  writer: string;
  @ApiProperty({ description: '프로젝트 인원 목록', type: [Members] })
  members: Members[];
  @ApiProperty({ description: '분야' })
  fields: string[];

  @ApiProperty({ description: '보고서 상세', type: ReportDetail })
  report: ReportDetail;
}
