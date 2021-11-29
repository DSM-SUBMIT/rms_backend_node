import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
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
}
