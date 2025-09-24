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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateResponseUndurDiriPpnsDto } from './dto/create.pemberhentian-undur-diri.dto';
import { PemberhentianUndurDiriService } from './pemberhentian-undur-diri.service';

@Controller('/pemberhentian-undur-diri')
export class PemberhentianUndurDiriController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private pemberhentianUndurDiriService: PemberhentianUndurDiriService,
  ) {}

  @Post('/create')
  @HttpCode(201)
  async createUndurDiri(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponseUndurDiriPpnsDto>> {
    const authorization = headers['authorization'] || '';

    const result = await this.pemberhentianUndurDiriService.storeUndurDiri(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_undur_diri_keputusan_pengangkatan', maxCount: 1 },
      { name: 'dok_undur_diri_keputusan_kenaikan_pangkat', maxCount: 1 },
      { name: 'dok_undur_diri_ktp_ppns', maxCount: 1 },
      { name: 'dok_undur_diri_surat_persetujuan', maxCount: 1 },
      { name: 'dok_undur_diri_surat_permohonan', maxCount: 1 },
    ]),
  )
  @Post('/upload-dokumen')
  @HttpCode(201)
  async createDokumen(
    @UploadedFiles()
    files: {
      dok_undur_diri_keputusan_pengangkatan?: Express.Multer.File[];
      dok_undur_diri_keputusan_kenaikan_pangkat?: Express.Multer.File[];
      dok_undur_diri_ktp_ppns?: Express.Multer.File[];
      dok_undur_diri_surat_persetujuan?: Express.Multer.File[];
      dok_undur_diri_surat_permohonan?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_undur_diri_keputusan_pengangkatan:
        files?.dok_undur_diri_keputusan_pengangkatan?.[0] ?? null,
      dok_undur_diri_keputusan_kenaikan_pangkat:
        files?.dok_undur_diri_keputusan_kenaikan_pangkat?.[0] ?? null,
      dok_undur_diri_ktp_ppns: files?.dok_undur_diri_ktp_ppns?.[0] ?? null,
      dok_undur_diri_surat_persetujuan:
        files?.dok_undur_diri_surat_persetujuan?.[0] ?? null,
      dok_undur_diri_surat_permohonan:
        files?.dok_undur_diri_surat_permohonan?.[0] ?? null,
    };

    const result = await this.pemberhentianUndurDiriService.storeUploadDokumen(
      request,
      authorization,
    );
    return { statusCode: 201, message: 'Success', data: result };
  }
}
