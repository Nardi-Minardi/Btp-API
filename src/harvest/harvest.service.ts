import { Injectable } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { HarvestRepository } from './harvest.repository';

@Injectable()
export class HarvestService {
  constructor(private readonly HhrvestRepository: HarvestRepository) {}

 
}
