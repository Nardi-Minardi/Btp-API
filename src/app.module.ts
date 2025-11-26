import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { HarvestModule } from './harvest/harves.module';
import { SpbModule } from './spb/spb.module';
import { RestanModule } from './restan/restan.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    CommonModule,
    AuthModule,
    HarvestModule,
    SpbModule,
    RestanModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
