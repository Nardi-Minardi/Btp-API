import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { SpbController } from './spb.controller';
import { SpbService } from './spb.service';
import { SpbRepository } from './spb.repository';

@Module({
  imports: [CommonModule],
  controllers: [SpbController],
  providers: [SpbService, SpbRepository],
  exports: [],
})
export class SpbModule {}
