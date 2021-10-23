import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  async getProjectsByField(
    fieldId: number[],
    limit: number,
    page: number,
  ): Promise<number[]> {
    return (
      await this.projectFieldRepository.find({
        where: { fieldId: In(fieldId) },
        take: limit,
        skip: limit * (page - 1),
        relations: ['projectId'],
      })
    )?.map((projectField) => {
      return projectField.projectId.id;
    });
  }
}
