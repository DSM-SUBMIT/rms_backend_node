import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from './entities/member.entity';

@Injectable()
export class MembersService {
  constructor(
    @InjectRepository(Member)
    private readonly membersRepository: Repository<Member>,
  ) {}

  async getUsersByProject(projectId: number): Promise<Member[]> {
    return await this.membersRepository.find({
      where: { projectId },
      relations: ['userId'],
    });
  }
}
