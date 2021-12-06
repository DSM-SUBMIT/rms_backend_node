import { Project } from 'src/shared/entities/project/project.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity()
export class Report {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Project, (project) => project.report, { primary: true })
  @JoinColumn({ name: 'project_id' })
  projectId: Project;

  @Column({ name: 'video_url', type: 'varchar', length: 256, nullable: true })
  videoUrl: string;

  @Column({ type: 'varchar', length: 15000, nullable: true })
  content: string;
}
