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
    return { result };
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
          idProvinsi: w.id_provinsi,
          idKabupaten: w.id_kabupaten,
          idKecamatan: w.id_kecamatan,
          idKelurahan: w.id_kelurahan,
        }),
      ),
    );

    const createData = {
      id_surat: createRequest.id_surat,

      identitas_pns: {
        nama: createRequest.identitas_pns.nama,
        nip: createRequest.identitas_pns.nip,
        nama_gelar: createRequest.identitas_pns.nama_gelar,
        jabatan: createRequest.identitas_pns.jabatan,
        pangkat_golongan: createRequest.identitas_pns.pangkat_golongan,
        jenis_kelamin: createRequest.identitas_pns.jenis_kelamin,
        agama: createRequest.identitas_pns.agama,
        nama_sekolah: createRequest.identitas_pns.nama_sekolah,
        gelar_terakhir: createRequest.identitas_pns.gelar_terakhir,
        no_ijazah: createRequest.identitas_pns.no_ijazah,
        tgl_ijazah: createRequest.identitas_pns.tgl_ijazah,
        tahun_lulus: createRequest.identitas_pns.tahun_lulus,
      },

      wilayah_kerja: createRequest.wilayah_kerja.map((w: any) => ({
        id_provinsi: w.id_provinsi,
        id_kabupaten: w.id_kabupaten,
        id_kecamatan: w.id_kecamatan,
        id_kelurahan: w.id_kelurahan,
        uu_dikawal: w.uu_dikawal,
      })),

      lokasi_penempatan: {
        id_provinsi: createRequest.lokasi_penempatan.id_provinsi,
        id_kabupaten: createRequest.lokasi_penempatan.id_kabupaten,
        unit_kerja: createRequest.lokasi_penempatan.unit_kerja,
      },
    };

    // Return sukses
    return {
      message: `Permohonan Ppns Surat dengan ID ${createRequest.id_surat} berhasil dikirim ke verifikator`,
    };
  }
}
