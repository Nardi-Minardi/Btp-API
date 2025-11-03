import { Injectable } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import {
  DataMasterRepository,
  ListWilayahParams,
} from './data-master.repository';

@Injectable()
export class DataMasterService {
  constructor(private readonly dataMasterRepository: DataMasterRepository) {}

  async listWilayah(
    params: ListWilayahParams,
  ): Promise<WebResponse<any[], Pagination>> {
    const { data, total } = await this.dataMasterRepository.listWilayah(params);
    const totalPage = Math.ceil(total / params.limit) || 1;
    return {
      status_code: 200,
      data,
      pagination: {
        current_page: params.page,
        total_page: totalPage,
        total_data: total,
      },
    };
  }
}
