import { AbstractRepository, EntityRepository } from 'typeorm';
import { Field } from './field.entity';

@EntityRepository(Field)
export class FieldRepository extends AbstractRepository<Field> {
  public async getFieldsByName(name: string[]): Promise<Field[]> {
    return name !== undefined
      ? await this.createQueryBuilder('field')
          .where('field.field IN (:name)', { name })
          .getMany()
      : undefined;
  }
}
