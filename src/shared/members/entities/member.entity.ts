import { Project } from '../../../projects/entities/project.entity';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Member {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Project, (project) => project.id, { primary: true })
  @JoinColumn({ name: 'project_id' })
  projectId: Project;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => User, (user) => user.id, { primary: true })
  @JoinColumn({ name: 'user_id' })
  userId: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role: string;
}
