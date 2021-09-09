import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Field } from './entities/field.entity';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldsRepository: Repository<Field>,
  ) {}

  async getFieldById(id: number): Promise<Field> {
    return await this.fieldsRepository.findOne(id);
  }
}
