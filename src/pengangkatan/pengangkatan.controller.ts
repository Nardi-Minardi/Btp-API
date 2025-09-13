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
  CreateResponsePengangkatanPpnsDto,
  CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto,
} from './dto/create.pengangkatan.dto';
import { PengangkatanService } from './pengangkatan.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('/pengangkatan')
export class PengangkatanController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private pengangkatanService: PengangkatanService,
  ) {}

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_tanda_terima_polisi', maxCount: 1 },
      { name: 'dok_tanda_terima_kejaksaan_agung', maxCount: 1 },
    ]),
  )
  @Post('/create')
  @HttpCode(201)
  async createVerifikasiPpns(
    @UploadedFiles()
    files: {
      dok_tanda_terima_polisi?: Express.Multer.File[];
      dok_tanda_terima_kejaksaan_agung?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePengangkatanPpnsDto>> {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_tanda_terima_polisi: files?.dok_tanda_terima_polisi?.[0] ?? null,
      dok_tanda_terima_kejaksaan_agung:
        files?.dok_tanda_terima_kejaksaan_agung?.[0] ?? null,
    };

    const result = await this.pengangkatanService.storePengangkatanPpns(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  //create surat
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_surat_permohonan_pengangkatan', maxCount: 1 },
      { name: 'dok_fotokopi_tamat_pendidikan', maxCount: 1 },
      { name: 'dok_surat_pertimbangan', maxCount: 1 },
      { name: 'foto', maxCount: 1 },
    ]),
  )
  @Post('/upload-dokumen')
  @HttpCode(201)
  async createDokumen(
    @UploadedFiles()
    files: {
      dok_surat_permohonan_pengangkatan?: Express.Multer.File[];
      dok_fotokopi_tamat_pendidikan?: Express.Multer.File[];
      dok_surat_pertimbangan?: Express.Multer.File[];
      foto?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<
    WebResponse<CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto>
  > {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_surat_permohonan_pengangkatan:
        files?.dok_surat_permohonan_pengangkatan?.[0] ?? null,
      dok_fotokopi_tamat_pendidikan:
        files?.dok_fotokopi_tamat_pendidikan?.[0] ?? null,
      dok_surat_pertimbangan: files?.dok_surat_pertimbangan?.[0] ?? null,
      foto: files?.foto?.[0] ?? null,
    };

    const result = await this.pengangkatanService.storeUploadDokumen(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }
}
