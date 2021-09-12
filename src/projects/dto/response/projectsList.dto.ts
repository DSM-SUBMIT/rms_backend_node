import { ProjectItem } from 'src/projects/interfaces/project.interface';

export class ProjectsListDto {
  order_by?: 'plan' | 'report';

  projects?: Array<ProjectItem>;
}
