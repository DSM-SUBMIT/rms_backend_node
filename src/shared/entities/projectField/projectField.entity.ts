import { Project } from 'src/shared/entities/project/project.entity';
import { Field } from 'src/shared/entities/field/field.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'project_field' })
export class ProjectField {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Field, (field) => field.projectField, {
    primary: true,
  })
  @JoinColumn({ name: 'field_id' })
  fieldId: Field;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Project, (project) => project.projectField, {
    primary: true,
  })
  @JoinColumn({ name: 'project_id' })
  projectId: Project;
}
