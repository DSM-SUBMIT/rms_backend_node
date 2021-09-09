import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Field } from './entities/field.entity';

@Injectable()
export class FieldsService {
  constructor(private readonly fieldsRepository: Repository<Field>) {}

  async getFieldById(id: number): Promise<Field> {
    return await this.fieldsRepository.findOne(id);
  }
}
