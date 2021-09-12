import { ProjectItem } from 'src/projects/interfaces/projectItem.interface';

export class ProjectsListDto {
  order_by?: 'plan' | 'report';

  projects?: Array<ProjectItem>;
}
