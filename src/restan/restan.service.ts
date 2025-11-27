import { Injectable, Inject } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { RestanRepository } from './restan.repository';
import { Logger } from 'winston';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class RestanService {
  @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger;
  constructor(private readonly restanRepository: RestanRepository) {}

  async getRestan(request: {
    start_date: string;
    end_date: string;
    company_ids?: number[];
  }): Promise<{ data: any[]; total: number }> {
    this.logger.info('Request get data Restan with params', { request });

    const restans = (await this.restanRepository.findAllRestan({
      start_date: request.start_date,
      end_date: request.end_date,
      company_ids: request.company_ids || [],
    })) as any[];
    
    const total = await this.restanRepository.countAllRestan({
      start_date: request.start_date,
      end_date: request.end_date,
      company_ids: request.company_ids || [],
    });

    return { data: restans, total };
  }
}
