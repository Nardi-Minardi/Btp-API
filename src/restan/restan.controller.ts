import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { RestanService } from './restan.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Module Restan')
@Controller('restan')
export class RestanController {
  constructor(private readonly restanService: RestanService) {}

  @Get('/')
  @ApiOperation({
    summary: 'Get Data Restan',
    description: 'Ambil data restan berdasarkan parameter',
  })
  @HttpCode(HttpStatus.OK)
  @ApiQuery({
    name: 'start_date',
    required: true,
    description: 'Tanggal mulai (YYYY-MM-DD)',
    example: '2025-10-01',
  })
  @ApiQuery({
    name: 'end_date',
    required: true,
    description: 'Tanggal akhir (YYYY-MM-DD)',
    example: '2025-10-31',
  })
  @ApiQuery({
    name: 'company_ids',
    required: false,
    description:
      'Daftar ID perusahaan (1,2,3 atau ?company_ids=1&company_ids=2)',
    example: ['1', '2', '3'],
  })
  @Public()
  async getAllModules(
    @Query('start_date') start_date: string,
    @Query('end_date') end_date: string,
    @Query('company_ids') company_ids_raw?: string | string[],
  ) {
    let company_ids: number[] = [];
    if (Array.isArray(company_ids_raw)) {
      company_ids = company_ids_raw.map((id) => Number(id)).filter(Boolean);
    } else if (typeof company_ids_raw === 'string') {
      company_ids = company_ids_raw
        .split(',')
        .map((id) => Number(id))
        .filter(Boolean);
    }

    const { data: result } = await this.restanService.getRestan({
      start_date,
      end_date,
      company_ids,
    });

    return {
      status_code: 200,
      message: 'success',
      data: result,
    };
  }
}
