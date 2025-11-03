import { Injectable } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  getDas(provinsi_code?: string) {
    return this.dashboardRepository.listDas(provinsi_code);
  }

  getDevices() {
    return this.dashboardRepository.listDevices();
  }
}
