import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

  async getIdsByField(field: string[]): Promise<number[]> {
    return field !== undefined
      ? (await this.fieldsRepository.find({ where: { field: In(field) } })).map(
          (field) => {
            return field.id;
          },
        )
      : undefined;
  }
}
