import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Plan } from './entities/plan.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Plan])],
  providers: [PlansService],
  exports: [PlansService],
})
export class PlansModule {}
