import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Field {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 10 })
  field: string;
}
