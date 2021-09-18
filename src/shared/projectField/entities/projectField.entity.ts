import { Project } from 'src/projects/entities/project.entity';
import { Field } from 'src/shared/fields/entities/field.entity';
import { Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity({ name: 'project_field' })
export class ProjectField {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Field, (field) => field.id, {
    primary: true,
    nullable: false,
  })
  @JoinColumn({ name: 'field_id' })
  fieldId: Field;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Project, (project) => project.id, {
    primary: true,
    nullable: false,
  })
  @JoinColumn({ name: 'project_id' })
  projectId: Project;
}
