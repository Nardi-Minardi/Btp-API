import { Body, Controller, Headers, Inject, NotFoundException, Param, Post, Get, Query, HttpCode, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CreateResponsePermohonanVerifikasiPpnsDataPnsDto, CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto, CreateResponsePermohonanVerifikasiSuratDto, CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto, CreateResponseSendVerifikatorDto } from './dto/create.permohonan-verifikasi.dto';
import { PermohonanVerifikasiService } from './permohonan-verifikasi.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ListPermohonanVerifikasiSurat } from './dto/get.permohonan-verifikasi.dto';
import { getUserFromToken } from 'src/common/utils/helper.util';
import { PermohonanVerifikasiRepository } from './permohonan-verifikasi.repository';

@Controller('/permohonan-verifikasi')
export class PermohonanVerifikasiController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private permohonanVerifikasiService: PermohonanVerifikasiService,
    private permohonanVerifikasiRepository: PermohonanVerifikasiRepository,
  ) {}

  @Get('/surat')
  @HttpCode(200)
  // @RedisCache('badan-usaha-perubahan-cv-list', 60)
  async getAllPermohonanVerifikasiSurat(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('orderBy') orderBy: string,
    @Query('orderDirection') orderDirection: 'asc' | 'desc' = 'asc',
    @Query('filters') filters: string,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<ListPermohonanVerifikasiSurat[], Pagination>> {
    let parsedFilters: Record<string, any> = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters); // langsung jadi object
      } catch (e) {
        console.warn('Invalid filters JSON:', filters);
      }
    }
    const authorization = headers['authorization'] || '';

    const result = await this.permohonanVerifikasiService.getListPermohonanVerifikasiSurat(
      {
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

  @Get('/surat/calon-ppns/:idSurat')
  @HttpCode(200)
  async detailPerubahanCv(
    @Param('idSurat') idSurat: string,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<any>> {
    const authorization = headers['authorization'] || '';

    const userLogin = await getUserFromToken(authorization);
    if (!userLogin) {
      throw new BadRequestException('Authorization is missing');
    }

    const item = await this.permohonanVerifikasiRepository.findPpnsDataPnsByIdSurat(
      Number(idSurat),
    );
    if (!item) {
      throw new BadRequestException('Perubahan not found');
    }

    return { statusCode: 200, message: 'Success', data: item };
  }

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

  @Post('/calon-ppns/create')
  @HttpCode(201)
  async createCalonPpns(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePermohonanVerifikasiPpnsDataPnsDto>> {
    const authorization = headers['authorization'] || '';
    const result = await this.permohonanVerifikasiService.storeCalonPpns(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }

  @Post('/verifikasi-ppns/create')
  @HttpCode(201)
  async createVerifikasiPpns(
    @Body() request,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto>> {
    const authorization = headers['authorization'] || '';
    const result = await this.permohonanVerifikasiService.storeVerifikasiPpns(
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
  ): Promise<WebResponse<CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto>> {
    const authorization = headers['authorization'] || '';
    const request = {
      ...body,
      dok_verifikasi_sk_masa_kerja: files?.dok_verifikasi_sk_masa_kerja?.[0] ?? null,
      dok_verifikasi_sk_pangkat: files?.dok_verifikasi_sk_pangkat?.[0] ?? null,
      dok_verifikasi_ijazah: files?.dok_verifikasi_ijazah?.[0] ?? null,
      dok_verifikasi_sk_jabatan_teknis_oph:
        files?.dok_verifikasi_sk_jabatan_teknis_oph?.[0] ?? null,
      dok_verifikasi_sehat_jasmani: files?.dok_verifikasi_sehat_jasmani?.[0] ?? null,
      dok_verifikasi_penilaian_pekerjaan:
        files?.dok_verifikasi_penilaian_pekerjaan?.[0] ?? null,
    };

    const result = await this.permohonanVerifikasiService.storeUploadDokumen(
      request,
      authorization,
    );

    return { statusCode: 201, message: 'Success', data: result };
  }
}
