import { Module } from '@nestjs/common';
import { StatusService } from './status.service';

@Module({
  controllers: [],
  providers: [StatusService],
})
export class StatusModule {}
