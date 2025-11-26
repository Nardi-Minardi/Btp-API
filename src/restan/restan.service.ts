import { Injectable } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { RestanRepository } from './restan.repository';

@Injectable()
export class RestanService {
  constructor(private readonly restanRepository: RestanRepository) {}
}
