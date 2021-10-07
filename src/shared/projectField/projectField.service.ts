import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectField } from './entities/projectField.entity';

@Injectable()
export class ProjectFieldService {
  constructor(
    @InjectRepository(ProjectField)
    private readonly projectFieldRepository: Repository<ProjectField>,
  ) {}

  async getFieldsByProject(projectId: number): Promise<ProjectField[]> {
    return await this.projectFieldRepository.find({
      where: { projectId },
      relations: ['fieldId'],
    });
  }
}
