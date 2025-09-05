import { Module } from '@nestjs/common';
import { DataMasterRepository } from './data-master.repository';
import { DataMasterController } from './data-master.controller';
import { DataMasterService } from './data-master.service';

@Module({
  controllers: [DataMasterController],
  providers: [DataMasterRepository, DataMasterService],
})
export class DataMasterModule {}
