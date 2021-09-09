import { Project } from 'src/projects/entities/project.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Status {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Project, { primary: true })
  @JoinColumn({
    name: 'project_id',
  })
  projectId: Project;

  @Column({
    name: 'is_plan_submitted',
    type: 'bit',
    nullable: false,
  })
  isPlanSubmitted: boolean;

  @Column({
    name: 'is_report_submitted',
    type: 'bit',
    nullable: false,
  })
  isReportSubmitted: boolean;

  @Column({ name: 'plan_submitted_at', type: 'datetime', nullable: true })
  planSubmittedAt: string;

  @Column({ name: 'report_submitted_at', type: 'datetime', nullable: true })
  reportSubmittedAt: string;

  @Column({ name: 'is_plan_accepted', type: 'bit', nullable: false })
  isPlanAccepted: boolean;

  @Column({
    name: 'is_report_accepted',
    type: 'bit',
    nullable: false,
  })
  isReportAccepted: boolean;
}
