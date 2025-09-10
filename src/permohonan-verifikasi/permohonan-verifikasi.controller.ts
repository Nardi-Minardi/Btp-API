import { Body, Controller, Headers, Inject, NotFoundException, Param, Post, Get, Query, HttpCode, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateResponsePermohonanVerifikasiPpnsDataPnsDto, CreateResponsePermohonanVerifikasiSuratDto, CreateResponseSendVerifikatorDto } from './dto/create.permohonan-verifikasi.dto';
import { PermohonanVerifikasiService } from './permohonan-verifikasi.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/permohonan-verifikasi')
export class PermohonanVerifikasiController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private permohonanVerifikasiService: PermohonanVerifikasiService,
  ) {}

  //create surat
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_surat_pernyataan', maxCount: 1 },
    ]),
  )
  @Post('/surat/create')
  @HttpCode(201)
  async createSurat(
    @UploadedFiles()
    files: {
      dok_surat_pernyataan?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePermohonanVerifikasiSuratDto>> {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_surat_pernyataan: files?.dok_surat_pernyataan?.[0] ?? null,
    };

    const result = await this.permohonanVerifikasiService.storeSurat(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @Post('/surat/send-to-verifikator')
  @HttpCode(201)
  async sendToVerifikator(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponseSendVerifikatorDto>> {
    const authorization = headers['authorization'] || '';
    const result = await this.permohonanVerifikasiService.doSendVerifikator(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @Post('/calon-ppns/create-step1')
  @HttpCode(201)
  async createCalonPpns(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePermohonanVerifikasiPpnsDataPnsDto>> {
    const authorization = headers['authorization'] || '';
    const result = await this.permohonanVerifikasiService.storeCalonPpnsStep1(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }
}
