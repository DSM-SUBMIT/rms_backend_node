import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: Repository<User>) {}

  async getUserById(id: number): Promise<User> {
    return await this.usersRepository.findOne(id);
  }
}
