import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { RestanController } from './restan.controller';
import { RestanService } from './restan.service';
import { RestanRepository } from './restan.repository';

@Module({
  imports: [CommonModule],
  controllers: [RestanController],
  providers: [RestanService, RestanRepository],
  exports: [],
})
export class RestanModule {}
