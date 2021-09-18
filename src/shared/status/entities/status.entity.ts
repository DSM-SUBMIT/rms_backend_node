import { Project } from 'src/projects/entities/project.entity';
import { BoolBitTransformer } from 'src/utils/transformers/boolBit.transformer';
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
    transformer: new BoolBitTransformer(),
  })
  isPlanSubmitted: boolean;

  @Column({
    name: 'is_report_submitted',
    type: 'bit',
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  isReportSubmitted: boolean;

  @Column({ name: 'plan_submitted_at', type: 'datetime', nullable: true })
  planSubmittedAt: Date;

  @Column({ name: 'report_submitted_at', type: 'datetime', nullable: true })
  reportSubmittedAt: Date;

  @Column({
    name: 'is_plan_accepted',
    type: 'bit',
    nullable: true,
    transformer: new BoolBitTransformer(),
  })
  isPlanAccepted: boolean;

  @Column({
    name: 'is_report_accepted',
    type: 'bit',
    nullable: true,
    transformer: new BoolBitTransformer(),
  })
  isReportAccepted: boolean;
}
