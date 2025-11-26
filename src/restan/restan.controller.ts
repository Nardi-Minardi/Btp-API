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
import { RestanService } from './restan.service';
import { RestanRepository } from './restan.repository';

@ApiTags('Module Restan')
@Controller('restan')
export class RestanController {
  constructor(
    private readonly restanService: RestanService,
    private readonly restanRepository: RestanRepository
  ) {}

  
}
