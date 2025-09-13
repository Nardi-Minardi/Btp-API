import { Body, Controller, Headers, Inject, NotFoundException, Param, Post, Get, Query, HttpCode, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { getUserFromToken } from 'src/common/utils/helper.util';
import { ListSurat } from './dto/get.surat.dto';
import {  CreateResponsePpnsDataPnsDto, CreateResponseSendVerifikatorDto, CreateResponseSuratDto } from './dto/create.surat.dto';
import { SuratRepository } from './surat.repository';
import { SuratService } from './surat.service';

@Controller('/surat')
export class SuratController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private suratService: SuratService,
    private suratRepository: SuratRepository,
  ) {}

  @Get('/')
  @HttpCode(200)
  // @RedisCache('badan-usaha-perubahan-cv-list', 60)
  async getAllSurat(
    @Query('layanan') layanan: string,
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('orderBy') orderBy: string,
    @Query('orderDirection') orderDirection: 'asc' | 'desc' = 'asc',
    @Query('filters') filters: string,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<ListSurat[], Pagination>> {
    let parsedFilters: Record<string, any> = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters); // langsung jadi object
      } catch (e) {
        console.warn('Invalid filters JSON:', filters);
      }
    }
    const authorization = headers['authorization'] || '';

    const result = await this.suratService.getListSurat(
      {
        layanan,
        search,
        page,
        limit,
        orderBy,
        orderDirection,
        filters: parsedFilters,
      },
      authorization,
    );
    return {
      statusCode: 200,
      message: 'Success',
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('/calon-ppns/:idSurat')
  @HttpCode(200)
  async detailCalonPpns(
    @Param('idSurat') idSurat: string,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<any>> {
    const authorization = headers['authorization'] || '';

    const userLogin = await getUserFromToken(authorization);
    if (!userLogin) {
      throw new BadRequestException('Authorization is missing');
    }

    const item = await this.suratRepository.findPpnsDataPnsByIdSurat(
      Number(idSurat),
    );
    if (!item) {
      throw new BadRequestException('Ppns Surat not found');
    }

    return { statusCode: 200, message: 'Success', data: item };
  }

  //create surat
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_surat_pernyataan', maxCount: 1 },
    ]),
  )
  @Post('/create')
  @HttpCode(201)
  async createSurat(
    @UploadedFiles()
    files: {
      dok_surat_pernyataan?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponseSuratDto>> {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_surat_pernyataan: files?.dok_surat_pernyataan?.[0] ?? null,
    };

    const result = await this.suratService.storeSurat(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @Post('/send-to-verifikator')
  @HttpCode(201)
  async sendToVerifikator(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponseSendVerifikatorDto>> {
    const authorization = headers['authorization'] || '';
    const result = await this.suratService.doSendVerifikator(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @Post('/calon-ppns/create')
  @HttpCode(201)
  async createCalonPpns(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePpnsDataPnsDto>> {
    const authorization = headers['authorization'] || '';
    const result = await this.suratService.storeCalonPpns(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }
}
