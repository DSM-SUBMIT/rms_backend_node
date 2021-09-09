import { ProjectField } from 'src/shared/projectField/entities/projectField.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  field: string;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @OneToMany((type) => ProjectField, (projectField) => projectField.fieldId)
  projectField: ProjectField[];
}
