import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: Repository<Project>) {}

  async getProject(id: number): Promise<Project> {
    return await this.projectsRepository.findOne(id);
  }
}
