import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class Admin {
  @PrimaryColumn({
    type: 'varchar',
    length: 15,
  })
  id: string;

  @Column({
    type: 'char',
    length: 60,
  })
  password: string;
}
