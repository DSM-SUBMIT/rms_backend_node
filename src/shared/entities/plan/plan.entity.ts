import { Project } from 'src/shared/entities/project/project.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Plan {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Project, (project) => project.plan, { primary: true })
  @JoinColumn({
    name: 'project_id',
  })
  projectId: Project;

  @Column({ type: 'varchar', length: 4000, nullable: true })
  goal: string;

  @Column({ type: 'varchar', length: 10000, nullable: true })
  content: string;

  @Column({ name: 'start_date', type: 'char', length: 7, nullable: true })
  startDate: string;

  @Column({ name: 'end_date', type: 'char', length: 7, nullable: true })
  endDate: string;

  @Column({
    name: 'include_result_report',
    nullable: true,
  })
  includeResultReport: boolean;

  @Column({
    name: 'include_code',
    nullable: true,
  })
  includeCode: boolean;

  @Column({
    name: 'include_outcome',
    nullable: true,
  })
  includeOutcome: boolean;

  @Column({
    name: 'include_others',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  includeOthers: string;
}
