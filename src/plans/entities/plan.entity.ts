import { Project } from '../../projects/entities/project.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

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
}
