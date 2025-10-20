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
  Query,
  Param,
  HttpException,
} from '@nestjs/common';
import { Pagination, WebResponse } from 'src/common/web.response';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ListDaftarVerifikasi } from './dto/get.admin.dto';
import { PrismaService } from 'src/common/prisma.service';
import {status_enum, verifikasi_enum} from '.prisma/main-client';
import { AdminValidation } from './admin.validation';
import { Http } from 'winston/lib/winston/transports';

@ApiTags('Admin')
@Controller('/daftar-verifikasi')
export class AdminController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private adminService: AdminService,
    private prismaService: PrismaService,
  ) {}

  @ApiOperation({ summary: 'Get Daftar Transaksi' })
  @Get('/')
  @HttpCode(200)
  // @RedisCache('badan-usaha-perubahan-cv-list', 60)
  async getAllSurat(
    @Query('search') search: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('orderBy') orderBy: string | null,
    @Query('orderDirection') orderDirection: 'asc' | 'desc' | null,
    @Query('filters') filters: string | null,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<ListDaftarVerifikasi[], Pagination>> {
    let parsedFilters: Record<string, any> = {};
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters); // langsung jadi object
      } catch (e) {
        console.warn('Invalid filters JSON:', filters);
      }
    }
    const authorization = headers['authorization'] || '';

    const result = await this.adminService.getListDaftarVerifikasi(
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

  //detail
  @ApiOperation({ summary: 'Get Detail Transasi by ID' })
  @Get('/detail/:id')
  @HttpCode(200)
  // @RedisCache('badan-usaha-perubahan-cv-list', 60)
  async getDetailTransasiById(
    @Param('id') id: string,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<any>> {
    const authorization = headers['authorization'] || '';
    const result = await this.prismaService.ppnsSurat.findFirst({
      where: {
        id: Number(id),
        status: true,
      },
      include: {
        ppns_data_pns: {
          include: {
            ppns_wilayah_kerja: true,
            ppns_upload: true,
            ppns_verifikasi_ppns: true,
            ppns_pengangkatan: true,
            ppns_pelantikan: true,
            ppns_mutasi: true,
            ppns_pengangkatan_kembali: true,
            ppns_perpanjang_ktp: true,
            ppns_penerbitan_ktp: true,
            ppns_pemberhentian_undur_diri: true,
            ppns_pemberhentian_pensiun: true,
            ppns_pemberhentian_nto: true,
          },
        },
      },
    });

    const { ppns_data_pns, ...rest } = result || {};

    const mappingResult = {
      ...rest,
      calon_ppns: ppns_data_pns || [],
    };

    return {
      statusCode: 200,
      message: 'Success',
      data: mappingResult,
    };
  }

//   model PpnsVerifikasiData {
//   id                     Int          @id @default(autoincrement())
//   id_surat               Int?         @db.Integer
//   id_data_ppns           Int?         @db.Integer
//   verifikasi_data        verifikasi_enum?
//   keterangan_data        String?      @db.Text
//   verifikasi_wilayah     verifikasi_enum?
//   keterangan_wilayah     String?      @db.Text
//   status_a               verifikasi_enum?
//   keterangan_a           String?      @db.Text
//   status_b               verifikasi_enum?
//   keterangan_b           String?      @db.Text
//   status_c               verifikasi_enum?
//   keterangan_c           String?      @db.Text
//   status_d               verifikasi_enum?
//   keterangan_d           String?      @db.Text
//   status_e               verifikasi_enum?
//   keterangan_e           String?      @db.Text
//   status_f               verifikasi_enum?
//   keterangan_f           String?      @db.Text
//   keterangan_verifikator String?      @db.Text
//   verifikator_by         Int?         @db.Integer
//   verifikator_at         DateTime?    @db.Timestamp(6)
//   status                 status_enum?

//   @@map("tr_ppns_verifikasi_data")
// }
// enum status_enum {
//   diterima @map("Diterima")
//   dataBaru @map("Data Baru")
// }

// enum verifikasi_enum {
//   sesuai @map("sesuai")
//   tidakSesuai @map("tidak sesuai")
//   tolak @map("tolak")
// }
  //do verification
  @ApiOperation({ summary: 'Verifikasi Data PPNS' })
  @Post('/verifikasi-data')
  @HttpCode(200)
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id_surat: { type: 'number' , example: 1 },
        id_data_ppns: { type: 'number' , example: 1 },
        verifikasi_data: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_data: { type: 'string', nullable: true },
        verifikasi_wilayah: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_wilayah: { type: 'string', nullable: true },
        status_a: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_a: { type: 'string', nullable: true },
        status_b: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_b: { type: 'string', nullable: true },
        status_c: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_c: { type: 'string', nullable: true },
        status_d: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_d: { type: 'string', nullable: true },
        status_e: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_e: { type: 'string', nullable: true },
        status_f: { type: 'string', enum: ['sesuai', 'tidak sesuai', 'tolak'] },
        keterangan_f: { type: 'string', nullable: true },
        keterangan_verifikasi: { type: 'string', nullable: true },
        verifikator_by: { type: 'number' },
        status: { type: 'string', enum: ['diterima', 'data baru'] },
      },
    },
  })
  async verifikasiDataPPNS(
    @Body() body: any,
    @Headers() headers: Record<string, any>,
  ): Promise<WebResponse<any>> {
    const authorization = headers['authorization'] || '';
    AdminValidation.PPNS_VERIFIKASI_DATA.parse(body); // Validasi input body

    const verifEnumMapped: verifikasi_enum | null = body.verifikasi_data
      ? (body.verifikasi_data as verifikasi_enum)
      : null;

    const statusEnumMapped: status_enum | null = body.status
      ? (body.status as status_enum)
      : null;

    //cek data surat
    const suratData = await this.prismaService.ppnsSurat.findUnique({
      where: {
        id: body.id_surat,
      },
    });

    if (!suratData) {
      throw new HttpException(`Surat dengan ID ${body.id_surat} tidak ditemukan`, 404);
    }

    //cek calo ppns
    const calonPpnsData = await this.prismaService.ppnsDataPns.findUnique({
      where: {
        id: body.id_data_ppns,
      },
    });

    if (!calonPpnsData) {
      throw new HttpException(`Calon PPNS dengan ID ${body.id_data_ppns} tidak ditemukan`, 404);
    }

    const result = await this.prismaService.ppnsVerifikasiData.create({
      data: {
        id_surat: body.id_surat,
        id_data_ppns: body.id_data_ppns,
        verifikasi_data: verifEnumMapped,
        keterangan_data: body.keterangan_data,
        verifikasi_wilayah: body.verifikasi_wilayah,
        keterangan_wilayah: body.keterangan_wilayah,
        status_a: body.status_a,
        keterangan_a: body.keterangan_a,
        status_b: body.status_b,
        keterangan_b: body.keterangan_b,
        status_c: body.status_c,
        keterangan_c: body.keterangan_c,
        status_d: body.status_d,  
        keterangan_d: body.keterangan_d,
        status_e: body.status_e,
        keterangan_e: body.keterangan_e,
        status_f: body.status_f,  
        keterangan_f: body.keterangan_f,
        keterangan_verifikasi: body.keterangan_verifikasi,
        verifikator_by: body.verifikator_by,
        verifikator_at: new Date(),
        status: statusEnumMapped,
      },
    });

    return {
      statusCode: 200,
      message: 'Verifikasi berhasil disimpan',
      data: result,
    };
  }
}
