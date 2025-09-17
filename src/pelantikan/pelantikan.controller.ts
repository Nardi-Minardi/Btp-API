import {
  Body,
  Controller,
  Headers,
  Inject,
  Post,
  HttpCode,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  CreateResponsePelantikanPpnsDto,
  CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto,
} from './dto/create.pelantikan.dto';
import { PelantikanService } from './pelantikan.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/pelantikan')
export class PelantikanController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private pelantikanService: PelantikanService,
  ) {}

  @Post('/create')
  @HttpCode(201)
  async createPelantikan(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePelantikanPpnsDto>> {
    const authorization = headers['authorization'] || '';

    const result = await this.pelantikanService.storePelantikan(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_pelantikan_surat_permohonan', maxCount: 1 },
      { name: 'dok_pelantikan_sk_menteri', maxCount: 1 },
      { name: 'dok_pelantikan_lampiran_menteri', maxCount: 1 },
    ]),
  )
  @Post('/upload-dokumen')
  @HttpCode(201)
  async createDokumen(
    @UploadedFiles()
    files: {
      dok_pelantikan_surat_permohonan?: Express.Multer.File[];
      dok_pelantikan_sk_menteri?: Express.Multer.File[];
      dok_pelantikan_lampiran_menteri?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<
    WebResponse<CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto>
  > {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_pelantikan_surat_permohonan:
        files?.dok_pelantikan_surat_permohonan?.[0] ?? null,
      dok_pelantikan_sk_menteri:
        files?.dok_pelantikan_sk_menteri?.[0] ?? null,
      dok_pelantikan_lampiran_menteri: files?.dok_pelantikan_lampiran_menteri?.[0] ?? null,
    };

    const result = await this.pelantikanService.storeUploadDokumen(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }
}
