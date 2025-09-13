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
import { CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto, CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto } from './dto/create.pengangkatan.dto';
import { PengangkatanService } from './pengangkatan.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/pengangkatan')
export class PengangkatanController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private pengangkatanService: PengangkatanService,
  ) {}

  @Post('/ppns/create')
  @HttpCode(201)
  async createVerifikasiPpns(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<
    WebResponse<CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto>
  > {
    const authorization = headers['authorization'] || '';
    const result = await this.pengangkatanService.storeVerifikasiPpns(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  //create surat
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_verifikasi_sk_masa_kerja', maxCount: 1 },
      { name: 'dok_verifikasi_sk_pangkat', maxCount: 1 },
      { name: 'dok_verifikasi_ijazah', maxCount: 1 },
      { name: 'dok_verifikasi_sk_jabatan_teknis_oph', maxCount: 1 },
      { name: 'dok_verifikasi_sehat_jasmani', maxCount: 1 },
      { name: 'dok_verifikasi_penilaian_pekerjaan', maxCount: 1 },
    ]),
  )
  @Post('/upload-dokumen')
  @HttpCode(201)
  async createDokumen(
    @UploadedFiles()
    files: {
      dok_verifikasi_sk_masa_kerja?: Express.Multer.File[];
      dok_verifikasi_sk_pangkat?: Express.Multer.File[];
      dok_verifikasi_ijazah?: Express.Multer.File[];
      dok_verifikasi_sk_jabatan_teknis_oph?: Express.Multer.File[];
      dok_verifikasi_sehat_jasmani?: Express.Multer.File[];
      dok_verifikasi_penilaian_pekerjaan?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<
    WebResponse<CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto>
  > {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_verifikasi_sk_masa_kerja:
        files?.dok_verifikasi_sk_masa_kerja?.[0] ?? null,
      dok_verifikasi_sk_pangkat: files?.dok_verifikasi_sk_pangkat?.[0] ?? null,
      dok_verifikasi_ijazah: files?.dok_verifikasi_ijazah?.[0] ?? null,
      dok_verifikasi_sk_jabatan_teknis_oph:
        files?.dok_verifikasi_sk_jabatan_teknis_oph?.[0] ?? null,
      dok_verifikasi_sehat_jasmani:
        files?.dok_verifikasi_sehat_jasmani?.[0] ?? null,
      dok_verifikasi_penilaian_pekerjaan:
        files?.dok_verifikasi_penilaian_pekerjaan?.[0] ?? null,
    };

    const result = await this.pengangkatanService.storeUploadDokumen(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }
}
