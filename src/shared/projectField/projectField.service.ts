import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ProjectField } from './entities/projectField.entity';

@Injectable()
export class ProjectFieldService {
  constructor(
    private readonly projectFieldRepository: Repository<ProjectField>,
  ) {}

  async getFieldsByProject(projectId: number): Promise<ProjectField[]> {
    return await this.projectFieldRepository.find({
      where: { projectId },
    });
  }
}
