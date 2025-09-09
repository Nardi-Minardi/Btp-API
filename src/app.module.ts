import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { DataMasterModule } from './data-master/data-master.module';
import { PermohonanVerifikasiModule } from './permohonan-verifikasi/permohonan-verifikasi.module';

@Module({
  imports: [
    CommonModule,
    AuthModule,
    UserModule,
    DataMasterModule,
    PermohonanVerifikasiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
