import { Controller, Get, Query, HttpStatus, HttpCode } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  // DAS endpoints
  @Get('das')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Get DAS list',
    description:
      'Mengambil daftar DAS (Daerah Aliran Sungai). Bisa difilter berdasarkan provinsi.',
  })
  @ApiQuery({
    name: 'provinsi_code',
    required: false,
    description: 'ID provinsi untuk filter DAS',
    example: '11',
  })
  async getDas(@Query('provinsi_code') provinsi_code?: string) {
    const data = await this.dashboardService.getDas(provinsi_code);
    return { success: true, data };
  }

  // Devices endpoints
  @Get('devices')
  @HttpCode(HttpStatus.OK)
  @Public()
  @ApiOperation({
    summary: 'Get Devices list',
    description:
      'Mengambil daftar device (ARR/AWLR/AWS) beserta status dan sensor terakhir.',
  })
  async getDevices() {
    const data = await this.dashboardService.getDevices();
    return { success: true, data };
  }
}
