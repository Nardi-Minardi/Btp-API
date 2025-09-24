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
  CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto,
  CreateResponsePerpanjangKtpPpnsDto,
} from './dto/create.perpanjang-ktp.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { PerpanjangKtpService } from './perpanjang-ktp.service';

@Controller('/perpanjang-ktp')
export class PerpanjangKtpController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private mutasiService: PerpanjangKtpService,
  ) {}

  @Post('/create')
  @HttpCode(201)
  async createPerpanjangKtp(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePerpanjangKtpPpnsDto>> {
    const authorization = headers['authorization'] || '';

    const result = await this.mutasiService.storePerpanjangKtp(request, authorization);

    return { statusCode: 201, message: 'Success', data: result };
  }

  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'dok_perpanjangan_ktp_sk_petikan', maxCount: 1 },
      { name: 'dok_perpanjangan_ktp_fotocopy_ktp', maxCount: 1 },
      { name: 'dok_perpanjangan_ktp_berita_acara', maxCount: 1 },
      { name: 'perpanjangan_ktp_pas_foto', maxCount: 1 },
    ]),
  )
  @Post('/upload-dokumen')
  @HttpCode(201)
  async createDokumen(
    @UploadedFiles()
    files: {
      dok_perpanjangan_ktp_sk_petikan?: Express.Multer.File[];
      dok_perpanjangan_ktp_fotocopy_ktp?: Express.Multer.File[];
      dok_perpanjangan_ktp_berita_acara?: Express.Multer.File[];
      perpanjangan_ktp_pas_foto?: Express.Multer.File[];
    },
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ) {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_perpanjangan_ktp_sk_petikan:
        files?.dok_perpanjangan_ktp_sk_petikan?.[0] ?? null,
      dok_perpanjangan_ktp_fotocopy_ktp:
        files?.dok_perpanjangan_ktp_fotocopy_ktp?.[0] ?? null,
      dok_perpanjangan_ktp_berita_acara: files?.dok_perpanjangan_ktp_berita_acara?.[0] ?? null,
      perpanjangan_ktp_pas_foto: files?.perpanjangan_ktp_pas_foto?.[0] ?? null,
    };

    const result = await this.mutasiService.storeUploadDokumen(
      request,
      authorization,
    );
    return { statusCode: 201, message: 'Success', data: result };
  }
}
