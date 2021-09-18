import { Project } from 'src/projects/entities/project.entity';
import { Field } from 'src/shared/fields/entities/field.entity';
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'project_field' })
export class ProjectField {
  @PrimaryGeneratedColumn()
  id: number;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Field, (field) => field.id, { nullable: false })
  @JoinColumn({ name: 'field_id' })
  fieldId: Field;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Project, (project) => project.id, { nullable: false })
  @JoinColumn({ name: 'project_id' })
  projectId: Project;
}
