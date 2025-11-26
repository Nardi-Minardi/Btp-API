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
import { SpbService } from './spb.service';
import { SpbRepository } from './spb.repository';

@ApiTags('Module SPB')
@Controller('spb')
export class SpbController {
  constructor(
    private readonly spbService: SpbService,
    private readonly spbRepository: SpbRepository,
  ) {}

  
}
