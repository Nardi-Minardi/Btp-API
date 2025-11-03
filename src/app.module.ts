import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DataMasterModule } from './data-master/data-master.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    AuthModule,
    CommonModule,
  DashboardModule,
  DataMasterModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
