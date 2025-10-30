import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
  Get,
} from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'src/common/prisma.service';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Sensor')
@Controller('/sensor')
export class SensorController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private prismaService: PrismaService,
  ) {}

  @Get('/list')
  @Public()
  @HttpCode(200)
  async listSensor(): Promise<any> {
    return { message: 'sensor data' };
  }
}
