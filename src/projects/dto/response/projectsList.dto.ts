import { ProjectItem } from 'src/projects/interfaces/projectItem.interface';

export class ProjectsListDto {
  total_page: number;
  total_amount: number;
  projects: Array<ProjectItem>;
}
