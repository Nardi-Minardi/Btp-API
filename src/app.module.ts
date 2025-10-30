import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { SensorModule } from './sensor/sensor.module';

@Module({
  imports: [
    SensorModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
