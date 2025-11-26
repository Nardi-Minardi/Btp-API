import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { HarvestController } from './harvest.controller';
import { HarvestService } from './harvest.service';
import { HarvestRepository } from './harvest.repository';

@Module({
  imports: [CommonModule],
  controllers: [HarvestController],
  providers: [HarvestService, HarvestRepository],
  exports: [],
})
export class HarvestModule {}
