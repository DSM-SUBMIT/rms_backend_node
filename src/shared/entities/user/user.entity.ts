import { Project } from 'src/shared/entities/project/project.entity';
import { Member } from 'src/shared/entities/member/member.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 30, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 6, unique: true })
  name: string;

  @Column({ name: 'student_number', type: 'int', nullable: true })
  studentNumber: number;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => Project, (project) => project.writerId)
  projects: Project[];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => Member, (member) => member.userId)
  members: Member[];
}
