import { Project } from '../../../projects/entities/project.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BoolBitTransformer } from 'src/utils/transformers/boolBit.transformer';

@Entity()
export class Plan {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Project, { primary: true })
  @JoinColumn({
    name: 'project_id',
  })
  projectId: Project;

  @Column({ type: 'varchar', length: 4000, nullable: false })
  goal: string;

  @Column({ type: 'varchar', length: 10000, nullable: false })
  content: string;

  @Column({ name: 'pdf_url', type: 'varchar', length: 256, nullable: true })
  pdfUrl: string;

  @Column({ name: 'start_date', type: 'char', length: 7, nullable: false })
  startDate: string;

  @Column({ name: 'end_date', type: 'char', length: 7 })
  endDate: string;

  @Column({
    name: 'include_result_report',
    type: 'bit',
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  includeResultReport: boolean;

  @Column({
    name: 'include_code',
    type: 'bit',
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  includeCode: boolean;

  @Column({
    name: 'include_outcome',
    type: 'bit',
    nullable: false,
    transformer: new BoolBitTransformer(),
  })
  includeOutcome: boolean;

  @Column({
    name: 'include_others',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  includeOthers!: string;
}
