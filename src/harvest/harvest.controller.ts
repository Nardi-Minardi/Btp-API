import {
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { Request as ExpressRequest } from 'express';
import { getUserFromToken } from 'src/common/utils/helper.util';
import { HarvestService } from './harvest.service';
import { HarvestRepository } from './harvest.repository';

@ApiTags('Module Harvest')
@Controller('harvest')
export class HarvestController {
  constructor(
    private readonly harvestService: HarvestService,
    private readonly harvestRepository: HarvestRepository
  ) {}


}
