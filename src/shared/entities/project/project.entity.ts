import { User } from 'src/shared/entities/user/user.entity';
import { Member } from 'src/shared/entities/member/member.entity';
import { Plan } from 'src/shared/entities/plan/plan.entity';
import { Report } from 'src/shared/entities/report/report.entity';
import { Status } from 'src/shared/entities/status/status.entity';
import { ProjectField } from 'src/shared/entities/projectField/projectField.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'project_name',
    type: 'varchar',
    length: 45,
  })
  projectName: string;

  @Column({ name: 'team_name', type: 'varchar', length: 30 })
  teamName: string;

  @Column({
    name: 'tech_stacks',
    type: 'varchar',
    length: 100,
  })
  techStacks: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @ManyToOne((type) => User, (user) => user.projects, { nullable: false })
  @JoinColumn({ name: 'writer_id' })
  writer: User;

  @Column({
    name: 'project_type',
    type: 'varchar',
    length: 45,
  })
  projectType: string;

  @Column({ name: 'github_url', type: 'varchar', length: 500, nullable: true })
  githubUrl: string;

  @Column({ name: 'service_url', type: 'varchar', length: 256, nullable: true })
  serviceUrl: string;

  @Column({ name: 'docs_url', type: 'varchar', length: 256, nullable: true })
  docsUrl: string;

  @Column({ type: 'varchar', length: 10 })
  teacher: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => Member, (member) => member.projectId)
  members: Member[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Plan, (plan) => plan.projectId)
  plan: Plan;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Report, (report) => report.projectId)
  report: Report;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToOne((type) => Status, (status) => status.projectId)
  status: Status;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => ProjectField, (projectField) => projectField.projectId)
  projectField: ProjectField[];
}
