import { Injectable } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { SpbRepository } from './spb.repository';

@Injectable()
export class SpbService {
  constructor(private readonly spbRepository: SpbRepository) {}

  
}
