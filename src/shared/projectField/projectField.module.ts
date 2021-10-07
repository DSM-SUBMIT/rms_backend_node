import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectField } from './entities/projectField.entity';
import { ProjectFieldService } from './projectField.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectField])],
  providers: [ProjectFieldService],
  exports: [ProjectFieldService],
})
export class ProjectFieldModule {}
