import { ProjectDetailDto } from './projectDetail.dto';

export class PlanDetailDto extends ProjectDetailDto {
  goal: string;
  content: string;
  start_date: string;
  end_date: string;
  includes: {
    result_report: boolean;
    code: boolean;
    outcome: boolean;
    others: boolean;
    others_content: string;
  };
}
