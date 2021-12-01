import { AbstractRepository, EntityRepository } from 'typeorm';
import { Admin } from './admin.entity';

export interface AdminFindOneOptions {
  id: string;
  includePassword?: boolean;
}

export interface AdminUpdatePasswordOptions {
  id: string;
  encrypted: string;
}

@EntityRepository(Admin)
export class AdminRepository extends AbstractRepository<Admin> {
  public async findOne({
    id,
    includePassword,
  }: AdminFindOneOptions): Promise<Partial<Admin>> {
    const qb = this.createQueryBuilder('admin')
      .select(['admin.id'])
      .where('id = :id', { id });

    if (includePassword) qb.addSelect(['admin.password']);

    return qb.getOne();
  }

  public async changePassword({
    id,
    encrypted,
  }: AdminUpdatePasswordOptions): Promise<boolean> {
    const res = await this.createQueryBuilder('admin')
      .update(Admin)
      .set({ password: encrypted })
      .where('id = :id', { id })
      .execute();

    return Boolean(res.affected);
  }
}
