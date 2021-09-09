import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Field } from './entities/field.entity';
import { FieldsService } from './fields.service';

@Module({
  imports: [TypeOrmModule.forFeature([Field])],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}
