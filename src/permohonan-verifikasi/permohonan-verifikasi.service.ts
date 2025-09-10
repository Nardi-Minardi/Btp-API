import {
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import {
  CreateRequestSendVerifikatorDto,
  CreateResponsePermohonanVerifikasiPpnsDataPnsDto,
  CreateResponsePermohonanVerifikasiSuratDto,
  CreateResponseSendVerifikatorDto,
} from './dto/create.permohonan-verifikasi.dto';
import { PermohonanVerifikasiValidation } from './permohonan-verifikasi.validation';
import {
  generateUniqueString,
  getUserFromToken,
} from 'src/common/utils/helper.util';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileUploadRepository } from 'src/file-upload/file-upload.repository';
import { PermohonanVerifikasiRepository } from './permohonan-verifikasi.repository';
import { S3Service } from 'src/common/s3.service';
import { status_upload_ii } from '.prisma/main-client';
import { PpnsUploadDto } from 'src/file-upload/dto/upload.dto';
import { validateWilayah } from 'src/common/utils/validateWilayah';
import { DataMasterRepository } from 'src/data-master/data-master.repository';

@Injectable()
export class PermohonanVerifikasiService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private fileUploadService: FileUploadService,
    private fileUploadRepository: FileUploadRepository,
    private permohonanVerifikasiRepository: PermohonanVerifikasiRepository,
    private dataMasterRepository: DataMasterRepository,
    private s3Service: S3Service,
  ) {}

  async storeSurat(
    request: any & {
      dok_surat_pernyataan: Express.Multer.File;
    },
    authorization?: string,
  ): Promise<CreateResponsePermohonanVerifikasiSuratDto> {
    this.logger.debug('Request Creating permohonan verifikasi surat', {
      request,
    });
    const createRequest = this.validationService.validate(
      PermohonanVerifikasiValidation.CREATE_PERMOHONAN_VERIFIKASI_SURAT,
      request,
    );

    //get user login
    const userLogin = await getUserFromToken(authorization);
    if (!userLogin) {
      this.logger.error('Authorization token is missing');
      throw new BadRequestException('Authorization is missing');
    }

    const noSurat = await generateUniqueString('PERMOHONAN-VERIFIKASI-SURAT-');

    const createData = {
      id_user: userLogin.user_id,
      id_layanan: Number(createRequest.id_layanan),
      lembaga_kementerian: Number(createRequest.lembaga_kementerian),
      instansi: Number(createRequest.instansi),
      no_surat: noSurat,
      tgl_surat: createRequest.tgl_surat,
      perihal: createRequest.perihal,
      nama_pengusul: createRequest.nama_pengusul,
      jabatan_pengusul: createRequest.jabatan_pengusul,
      status: false,
      created_by: userLogin.user_id,
    };

    const result =
      await this.permohonanVerifikasiRepository.savePermohonanVerifikasiSurat(
        createData,
      );

    const dataUploadDB: PpnsUploadDto[] = [];

    // jika ada dokumen surat pernyataan
    if (request.dok_surat_pernyataan) {
      if (result.id_user === null) {
        throw new BadRequestException('User ID is missing');
      }

      const existing = await this.fileUploadRepository.findFilePpnsUpload(
        'dokumen-surat-pernyataan',
        result.id,
        result.id_user,
      );

      if (existing?.s3_key) {
        await this.s3Service.deleteFile(existing.s3_key);
      }

      const upload = await this.fileUploadService.handleUpload(
        request.dok_surat_pernyataan,
        'dokumen-surat-pernyataan',
        result.id,
        result.id_user,
        'verifikasi',
        1,
        'dokumen-surat-pernyataan',
        status_upload_ii.pending,
      );

      dataUploadDB.push(upload);
    }

    // simpan file upload ke DB
    if (dataUploadDB.length > 0) {
      await this.permohonanVerifikasiRepository.createOrUpdatePpnsUpload(
        result.id,
        dataUploadDB,
      );
    }

    // mapping hasil ke DTO (pastikan tanggal diubah ke ISO string)
    const response: CreateResponsePermohonanVerifikasiSuratDto = {
      ...result,
      no_surat: result.no_surat ?? '',
      tgl_surat: result.tgl_surat ? result.tgl_surat.toISOString() : '',
      created_at: result.created_at ? result.created_at.toISOString() : '',
      verifikator_at: result.verifikator_at
        ? result.verifikator_at.toISOString()
        : null,
    };

    return response;
  }

  async doSendVerifikator(
    request: CreateRequestSendVerifikatorDto,
    authorization?: string,
  ): Promise<CreateResponseSendVerifikatorDto> {
    this.logger.debug('Request send permohonan verifikator surat', { request });

    // Handle if body is empty
    if (!request || Object.keys(request).length === 0) {
      this.logger.error('Request body is empty');
      throw new BadRequestException('Request body cannot be empty');
    }

    const createRequest = this.validationService.validate(
      PermohonanVerifikasiValidation.CREATE_SEND_VERIFIKATOR,
      request,
    );

    //get user login
    const userLogin = await getUserFromToken(authorization);
    if (!userLogin) {
      this.logger.error('Authorization token is missing');
      throw new BadRequestException('Authorization is missing');
    }

    const existingSurat =
      await this.permohonanVerifikasiRepository.findPpnSuratById(
        createRequest.id_surat,
      );

    if (!existingSurat) {
      throw new HttpException(
        `Data Ppns surat dengan ID ${createRequest.id_surat} tidak ditemukan`,
        400,
      );
    }

    //cek jika statusnya true, berarti sudah dikirim ke verifikator
    if (existingSurat.status === true) {
      throw new HttpException(
        `Data Ppns surat dengan ID ${createRequest.id_surat} sudah dikirim ke verifikator`,
        400,
      );
    }

    //update statusnya
    await this.permohonanVerifikasiRepository.updateStatusPpnSurat(
      createRequest.id_surat,
      true,
    );

    // Return sukses
    return {
      message: `Permohonan Ppns Surat dengan ID ${createRequest.id_surat} berhasil dikirim ke verifikator`,
    };
  }

  async storeCalonPpnsStep1(
    request: any,
    authorization?: string,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsDataPnsDto> {
    this.logger.debug('Request send permohonan verifikator surat', { request });

    // Handle if body is empty
    if (!request || Object.keys(request).length === 0) {
      this.logger.error('Request body is empty');
      throw new BadRequestException('Request body cannot be empty');
    }

    const createRequest = this.validationService.validate(
      PermohonanVerifikasiValidation.CREATE_CALON_PPNS_STEP1,
      request,
    );

    //get user login
    const userLogin = await getUserFromToken(authorization);
    if (!userLogin) {
      this.logger.error('Authorization token is missing');
      throw new BadRequestException('Authorization is missing');
    }

    const existingSurat =
      await this.permohonanVerifikasiRepository.findPpnSuratById(
        createRequest.id_surat,
      );

    if (!existingSurat) {
      throw new HttpException(
        `Data Ppns surat dengan ID ${createRequest.id_surat} tidak ditemukan`,
        400,
      );
    }

    //cek jika statusnya true, berarti sudah dikirim ke verifikator
    if (existingSurat.status === true) {
      throw new HttpException(
        `Data Ppns surat dengan ID ${createRequest.id_surat} sudah dikirim ke verifikator tidak bisa ditambahkan calon ppns`,
        400,
      );
    }

    //validasi wilayah kerja
    await Promise.all(
      createRequest.wilayah_kerja.map((w: any) =>
        validateWilayah(this.dataMasterRepository, {
          idProvinsi: w.provinsi_penempatan,
          idKabupaten: w.kabupaten_penempatan,
          idKecamatan: w.id_kecamatan || undefined,
          idKelurahan: w.id_kelurahan || undefined,
        }),
      ),
    );

    const existingPpnsDataPns =
      await this.permohonanVerifikasiRepository.findPpnDataPnsByIdSurat(
        createRequest.id_surat,
      );

    const createData = {
      id_surat: createRequest.id_surat,
      nama: createRequest.identitas_pns.nama,
      nip: createRequest.identitas_pns.nip,
      nama_gelar: createRequest.identitas_pns.nama_gelar,
      jabatan: createRequest.identitas_pns.jabatan,
      pangkat_atau_golongan: createRequest.identitas_pns.pangkat_golongan,
      jenis_kelamin: createRequest.identitas_pns.jenis_kelamin,
      agama: createRequest.identitas_pns.agama,
      nama_sekolah: createRequest.identitas_pns.nama_sekolah,
      gelar_terakhir: createRequest.identitas_pns.gelar_terakhir,
      no_ijazah: createRequest.identitas_pns.no_ijazah,
      tgl_ijazah: createRequest.identitas_pns.tgl_ijazah, // sudah Date dari Zod
      tahun_lulus: createRequest.identitas_pns.tahun_lulus,

      // nested create relasi
      ppns_wilayah_kerja: {
        create: createRequest.wilayah_kerja.map((w: any) => {
          const [uu1, uu2, uu3] = w.uu_dikawal;
          return {
            id_surat: createRequest.id_surat,
            id_layanan: createRequest.id_layanan,
            provinsi_penempatan: w.provinsi_penempatan,
            kabupaten_penempatan: w.kabupaten_penempatan,
            unit_kerja: w.unit_kerja,
            penempatan_baru: w.penempatan_baru ? '1' : '0',
            uu_dikawal_1: uu1 ?? null,
            uu_dikawal_2: uu2 ?? null,
            uu_dikawal_3: uu3 ?? null,
          };
        }),
      },
    };

    let result;

    if (existingPpnsDataPns) {
      //update
      result =
        await this.permohonanVerifikasiRepository.updatePermohonanVerifikasiPpnsDataPns(
          existingPpnsDataPns.id,
          {
            ...createData,
            ppns_wilayah_kerja: {
              deleteMany: {}, // delete all existing related wilayah kerja
              create: createRequest.wilayah_kerja.map((w: any) => {
                const [uu1, uu2, uu3] = w.uu_dikawal;
                return {
                  id_surat: createRequest.id_surat,
                  id_layanan: createRequest.id_layanan,
                  provinsi_penempatan: w.provinsi_penempatan,
                  kabupaten_penempatan: w.kabupaten_penempatan,
                  unit_kerja: w.unit_kerja,
                  penempatan_baru: w.penempatan_baru ? '1' : '0',
                  uu_dikawal_1: uu1 ?? null,
                  uu_dikawal_2: uu2 ?? null,
                  uu_dikawal_3: uu3 ?? null,
                };
              }),
            },
          },
        );
    } else {
      // create data calon ppns
      result =
        await this.permohonanVerifikasiRepository.savePermohonanVerifikasiPpnsDataPns(
          createData,
        );
    }

    return result;
  }
}
