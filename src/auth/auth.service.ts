import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from './entities/admin.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Admin)
    private readonly adminsRepository: Repository<Admin>,
  ) {}

  async encrypt(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async validateUser(id: string, password: string): Promise<boolean> {
    const res = await this.adminsRepository.findOne(id);
    if (!res) return false;
    return await bcrypt.compare(password, res.password);
  }
}
