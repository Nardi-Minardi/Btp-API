import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { ValidationService } from 'src/common/validation.service';
import { Logger } from 'winston';
import { DataMasterValidation } from './data-master.validation';
import { DataMasterRepository } from './data-master.repository';
import { ResponseNotarisPenggantiDto } from './dto/notaris-pengganti.dto';

@Injectable()
export class DataMasterService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private logger: Logger,
    private validationService: ValidationService,
    private dataMasterRepository: DataMasterRepository,
  ) {}

  private readonly jangkaWaktuMapper = {
    terbatas: 'Terbatas',
    tidakTerbatas: 'Tidak Terbatas',
  };

  private readonly statusPengajuanMapper = {
    belumTerkonfirmasi: 'Belum Terkonfirmasi',
    sudahTerkonfirmasi: 'Sudah Terkonfirmasi',
  };

  private readonly jabatanMapper = {
    sekutuPasif: 'Sekutu Pasif',
    sekutuAktif: 'Sekutu Aktif',
  };

  private readonly kontribusiMapper = {
    uang: 'Uang',
    barang: 'Barang',
  };

  async searchNotarisPengganti(request: {
    nama: string;
  }): Promise<ResponseNotarisPenggantiDto> {
    this.logger.debug('Searching for Notaris Pengganti with request:', request);

    const getRequest: { nama: string } = this.validationService.validate(
      DataMasterValidation.SEARCH_NOTARIS_PENGGANTI,
      request,
    );
    // console.log('Validated request:', getRequest);

    // Kalau search kosong/null → return kosong
    if (!getRequest.nama || getRequest.nama.trim() === '') {
      return {
        list: [],
        countData: 0,
      };
    }

    // Get notaris
    const notaris = await this.dataMasterRepository.getNotarisPenggantiByNama(
      getRequest.nama,
    );

    if (!notaris || notaris.length === 0) {
      this.logger.error(`Notaris with nama "${getRequest.nama}" not found`);
      return {
        list: [],
        countData: 0,
      };
    }

    const countData =
      await this.dataMasterRepository.countSearchNotarisPengganti(
        getRequest.nama,
      );

    return {
      list: notaris.map((item) => ({
        id: item.id,
        nama: item.nama,
        provinsi: item.provinsi,
        idProvinsi: item.id_provinsi,
      })),
      countData,
    };
  }

  /**
   * Validasi semua KBLI berdasarkan daftar id_kbli
   * Akan throw NotFoundException kalau ada ID yang tidak ditemukan
   */
  async validateKblis(ids: number[]): Promise<void> {
    if (!ids || ids.length === 0) {
      return; // tidak ada KBLI untuk dicek
    }

    this.logger.debug(`Validating KBLI IDs: [${ids.join(', ')}]`);

    const kbliResults = await Promise.all(
      ids.map((id) => this.dataMasterRepository.getKbliById(id)),
    );

    const notFoundKbliIds = ids.filter((_, index) => !kbliResults[index]);

    if (notFoundKbliIds.length > 0) {
      throw new NotFoundException(
        `KBLI dengan ID [${notFoundKbliIds.join(', ')}] tidak ditemukan di database`,
      );
    }
  }

  transformCv(item: any) {
    return {
      id: item.id_cv,
      idNotaris: item.id_notaris ? Number(item.id_notaris) : null,
      pengajuanNama: item.pengajuanNamaCv
        ? {
            idPengajuan: item.pengajuanNamaCv.id_pengajuan,
            nama: item.pengajuanNamaCv.nama,
            singkatan: item.pengajuanNamaCv.singkatan,
            noPengajuan: item.pengajuanNamaCv.no_pengajuan,
            statusPendirian: item.pengajuanNamaCv.status_pendirian,
            expiredAt: item.pengajuanNamaCv.status_expiredAt,
          }
        : null,
      noTransaksi: item.no_transaksi ?? null,
      noSurat: item.no_surat ?? null,
      noTelpon: item.no_telpon ?? null,
      email: item.email ?? null,
      batasWaktu: item.batas_waktu ?? null,
      idProvinsi: item.id_provinsi ? Number(item.id_provinsi) : null,
      idKabupaten: item.id_kabupaten ? Number(item.id_kabupaten) : null,
      idKecamatan: item.id_kecamatan ? Number(item.id_kecamatan) : null,
      idKelurahan: item.id_kelurahan ? Number(item.id_kelurahan) : null,
      idProvinsiAkta: item.id_provinsi_akta
        ? Number(item.id_provinsi_akta)
        : null,
      idKabupatenAkta: item.id_kabupaten_akta
        ? Number(item.id_kabupaten_akta)
        : null,
      alamat: item.alamat ?? null,
      rt: item.rt ?? null,
      rw: item.rw ?? null,
      kodePos: item.kode_pos ?? null,
      npwp: item.npwp ?? null,
      noAkta: item.no_akta ?? null,
      tglAkta: item.tgl_akta ?? null,
      idNotarisPengganti: item.id_notaris_pengganti ?? null,
      jumlahAset: item.jumlah_aset ? Number(item.jumlah_aset) : null,
      statusPengajuan: item.status_pengajuan
        ? this.statusPengajuanMapper[item.status_pengajuan]
        : '',
      alasanPembubaran: item.alasan_pembubaran ?? null,
      noPutusanPeradilan: item.no_putusan_peradilan ?? null,
      tglPutusanPeradilan: item.tgl_putusan_peradilan ?? null,
      noDokPembubaran: item.no_dok_pembubaran ?? null,
      tglDokPembubaran: item.tgl_dok_pembubaran ?? null,
      aktif: item.aktif ?? null,
      createdAt: item.created_at ?? null,
      createdBy: item.created_by ?? null,
      verifiedBy: item.verified_by ?? null,
      jangkaWaktu: item.jangka_waktu
        ? this.jangkaWaktuMapper[item.jangka_waktu]
        : '',
      deleted: item.deleted ?? null,
      blokir: item.blokir ?? null,
    };
  }

  transformFirma(item: any) {
    // hampir sama dengan CV tapi field ikut tabel firma
    return {
      id: item.id_firma,
      idNotaris: item.id_notaris ? Number(item.id_notaris) : null,
      pengajuanNama: item.pengajuanNamaFirma
        ? {
            idPengajuan: item.pengajuanNamaFirma.id_pengajuan,
            nama: item.pengajuanNamaFirma.nama,
            singkatan: item.pengajuanNamaFirma.singkatan,
            noPengajuan: item.pengajuanNamaFirma.no_pengajuan,
            statusPendirian: item.pengajuanNamaFirma.status_pendirian,
            expiredAt: item.pengajuanNamaFirma.status_expiredAt,
          }
        : null,
      noTransaksi: item.no_transaksi ?? null,
      noSurat: item.no_surat ?? null,
      noTelpon: item.no_telpon ?? null,
      email: item.email ?? null,
      batasWaktu: item.batas_waktu ?? null,
      idProvinsi: item.id_provinsi ? Number(item.id_provinsi) : null,
      idKabupaten: item.id_kabupaten ? Number(item.id_kabupaten) : null,
      idKecamatan: item.id_kecamatan ? Number(item.id_kecamatan) : null,
      idKelurahan: item.id_kelurahan ? Number(item.id_kelurahan) : null,
      idProvinsiAkta: item.id_provinsi_akta
        ? Number(item.id_provinsi_akta)
        : null,
      idKabupatenAkta: item.id_kabupaten_akta
        ? Number(item.id_kabupaten_akta)
        : null,
      alamat: item.alamat ?? null,
      rt: item.rt ?? null,
      rw: item.rw ?? null,
      kodePos: item.kode_pos ?? null,
      npwp: item.npwp ?? null,
      noAkta: item.no_akta ?? null,
      tglAkta: item.tgl_akta ?? null,
      idNotarisPengganti: item.id_notaris_pengganti ?? null,
      jumlahAset: item.jumlah_aset ? Number(item.jumlah_aset) : null,
      statusPengajuan: item.status_pengajuan
        ? this.statusPengajuanMapper[item.status_pengajuan]
        : '',
      alasanPembubaran: item.alasan_pembubaran ?? null,
      noPutusanPeradilan: item.no_putusan_peradilan ?? null,
      tglPutusanPeradilan: item.tgl_putusan_peradilan ?? null,
      noDokPembubaran: item.no_dok_pembubaran ?? null,
      tglDokPembubaran: item.tgl_dok_pembubaran ?? null,
      aktif: item.aktif ?? null,
      createdAt: item.created_at ?? null,
      createdBy: item.created_by ?? null,
      verifiedBy: item.verified_by ?? null,
      jangkaWaktu: item.jangka_waktu
        ? this.jangkaWaktuMapper[item.jangka_waktu]
        : '',
      deleted: item.deleted ?? null,
      blokir: item.blokir ?? null,
    };
  }

  transformPerdata(item: any) {
    return {
      id: item.id_perdata,
      idNotaris: item.id_notaris ? Number(item.id_notaris) : null,
      pengajuanNama: item.pengajuanNamaPerdata
        ? {
            idPengajuan: item.pengajuanNamaPerdata.id_pengajuan,
            nama: item.pengajuanNamaPerdata.nama,
            singkatan: item.pengajuanNamaPerdata.singkatan,
            noPengajuan: item.pengajuanNamaPerdata.no_pengajuan,
            statusPendirian: item.pengajuanNamaPerdata.status_pendirian,
            expiredAt: item.pengajuanNamaPerdata.status_expiredAt,
          }
        : null,
      noTransaksi: item.no_transaksi ?? null,
      noSurat: item.no_surat ?? null,
      noTelpon: item.no_telpon ?? null,
      email: item.email ?? null,
      batasWaktu: item.batas_waktu ?? null,
      idProvinsi: item.id_provinsi ? Number(item.id_provinsi) : null,
      idKabupaten: item.id_kabupaten ? Number(item.id_kabupaten) : null,
      idKecamatan: item.id_kecamatan ? Number(item.id_kecamatan) : null,
      idKelurahan: item.id_kelurahan ? Number(item.id_kelurahan) : null,
      idProvinsiAkta: item.id_provinsi_akta
        ? Number(item.id_provinsi_akta)
        : null,
      idKabupatenAkta: item.id_kabupaten_akta
        ? Number(item.id_kabupaten_akta)
        : null,
      alamat: item.alamat ?? null,
      rt: item.rt ?? null,
      rw: item.rw ?? null,
      kodePos: item.kode_pos ?? null,
      npwp: item.npwp ?? null,
      noAkta: item.no_akta ?? null,
      tglAkta: item.tgl_akta ?? null,
      idNotarisPengganti: item.id_notaris_pengganti ?? null,
      jumlahAset: item.jumlah_aset ? Number(item.jumlah_aset) : null,
      statusPengajuan: item.status_pengajuan
        ? this.statusPengajuanMapper[item.status_pengajuan]
        : '',
      alasanPembubaran: item.alasan_pembubaran ?? null,
      noPutusanPeradilan: item.no_putusan_peradilan ?? null,
      tglPutusanPeradilan: item.tgl_putusan_peradilan ?? null,
      noDokPembubaran: item.no_dok_pembubaran ?? null,
      tglDokPembubaran: item.tgl_dok_pembubaran ?? null,
      aktif: item.aktif ?? null,
      createdAt: item.created_at ?? null,
      createdBy: item.created_by ?? null,
      verifiedBy: item.verified_by ?? null,
      jangkaWaktu: item.jangka_waktu
        ? this.jangkaWaktuMapper[item.jangka_waktu]
        : '',
      deleted: item.deleted ?? null,
      blokir: item.blokir ?? null,
    };
  }
}
