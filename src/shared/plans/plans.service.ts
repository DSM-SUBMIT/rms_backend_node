import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan) private readonly plansRepository: Repository<Plan>,
  ) {}

  async getPlanById(id: number): Promise<Plan> {
    return await this.plansRepository.findOne(id, {
      relations: ['projectId', 'projectId.userId'],
    });
  }
}
