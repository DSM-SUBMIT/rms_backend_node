import { Project } from 'src/shared/entities/project/project.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Status {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Project, (project) => project.status, { primary: true })
  @JoinColumn({
    name: 'project_id',
  })
  projectId: Project;

  @Column({
    name: 'is_plan_submitted',
  })
  isPlanSubmitted: boolean;

  @Column({
    name: 'is_report_submitted',
  })
  isReportSubmitted: boolean;

  @Column({ name: 'plan_submitted_at', type: 'datetime', nullable: true })
  planSubmittedAt: Date;

  @Column({ name: 'report_submitted_at', type: 'datetime', nullable: true })
  reportSubmittedAt: Date;

  @Column({
    name: 'is_plan_accepted',
    nullable: true,
  })
  isPlanAccepted: boolean;

  @Column({
    name: 'is_report_accepted',
    nullable: true,
  })
  isReportAccepted: boolean;
}
