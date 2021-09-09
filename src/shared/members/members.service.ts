import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MembersService {
  constructor(private readonly membersRepository: Repository<Member>) {}

  async getUsersByProject(projectId: number): Promise<Member[]> {
    return await this.membersRepository.find({ where: { projectId } });
  }
}
