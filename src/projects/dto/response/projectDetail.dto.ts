export class ProjectDetailDto {
  project_name: string;
  writer: string;
  members: { name: string; role: string }[];
}
