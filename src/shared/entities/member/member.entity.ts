import { Project } from 'src/shared/entities/project/project.entity';
import { User } from 'src/shared/entities/user/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Member {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => Project, (project) => project.members, { primary: true })
  @JoinColumn({ name: 'project_id' })
  projectId: Project;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => User, (user) => user.members, { primary: true })
  @JoinColumn({ name: 'user_id' })
  userId: User;

  @Column({ type: 'varchar', length: 100, nullable: true })
  role: string;
}
