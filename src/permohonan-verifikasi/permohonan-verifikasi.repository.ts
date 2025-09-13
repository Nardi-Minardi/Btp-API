import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterPrismaService, PrismaService } from 'src/common/prisma.service';
import { Prisma, status_upload_ii } from '.prisma/main-client/client';
import { CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto } from './dto/create.permohonan-verifikasi.dto';
import { SuratRepository } from 'src/surat/surat.repository';

@Injectable()
export class PermohonanVerifikasiRepository {
  constructor(
    private readonly masterPrismaService: MasterPrismaService,
    private readonly prismaService: PrismaService,
    private readonly suratRepository: SuratRepository,
  ) {}

  async savePpnsVerifikasiPns(
    data: Prisma.PpnsVerifikasiPpnsCreateInput,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto> {
    const result = await this.prismaService.ppnsVerifikasiPpns.create({
      data,
    });

    // Cari id_surat dari relasi
    let idSurat: number | null = null;
    if (typeof result.id_data_ppns === 'number') {
      const d = await this.suratRepository.findPpnsDataPnsById(
        result.id_data_ppns,
      );
      if (!d) throw new NotFoundException('Data PNS not found');
      idSurat = d.id_surat ?? null;
    }

    return {
      id: result.id,
      id_data_ppns: result.id_data_ppns,
      id_surat: idSurat,
      masa_kerja: {
        tgl_pengangkatan_sk_pns: result.tgl_pengangkatan_sk_pns
          ? result.tgl_pengangkatan_sk_pns.toISOString()
          : null,
        sk_kenaikan_pangkat: result.sk_kenaikan_pangkat ?? null,
      },
      pendidikan_terakhir: {
        nama_sekolah: result.nama_sekolah ?? null,
        no_ijazah: result.no_ijazah ?? null,
        tgl_ijazah: result.tgl_ijazah ? result.tgl_ijazah.toISOString() : null,
        tgl_lulus: result.tgl_lulus ? result.tgl_lulus.toISOString() : null,
      },
      teknis_operasional_penegak_hukum:
        result.teknis_operasional_penegak_hukum === '1'
          ? true
          : result.teknis_operasional_penegak_hukum === '0'
            ? false
            : null,
      jabatan: result.jabatan ?? null,
      surat_sehat_jasmani_rohani: {
        nama_rs: result.nama_rs ?? null,
        tgl_surat_rs: result.tgl_surat_rs
          ? result.tgl_surat_rs.toISOString()
          : null,
      },
      dp3: {
        tahun_1: result.tahun_1 ?? null,
        nilai_1: result.nilai_1 ? Number(result.nilai_1) : null,
        tahun_2: result.tahun_2 ?? null,
        nilai_2: result.nilai_2 ? Number(result.nilai_2) : null,
      },
    };
  }

  async updatePpnsVerifikasiPns(
    id: number,
    data: Prisma.PpnsVerifikasiPpnsUpdateInput,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto> {
    // Cari id_surat lebih awal
    let idSurat: number | null = null;
    if (typeof data.id_data_ppns === 'number') {
      const pnsData = await this.suratRepository.findPpnsDataPnsById(
        data.id_data_ppns,
      );
      if (!pnsData) throw new NotFoundException('Data PNS not found');
      idSurat = pnsData.id_surat ?? null;
    }

    const result = await this.prismaService.ppnsVerifikasiPpns.update({
      where: { id },
      data,
    });

    // Destructure supaya tahun_1, nilai_1, tahun_2, nilai_2 tidak ikut di spread
    const { tahun_1, nilai_1, tahun_2, nilai_2 } = result;

    return {
      id: result.id,
      id_data_ppns: result.id_data_ppns,
      id_surat: idSurat,
      masa_kerja: {
        tgl_pengangkatan_sk_pns: result.tgl_pengangkatan_sk_pns
          ? result.tgl_pengangkatan_sk_pns.toISOString()
          : null,
        sk_kenaikan_pangkat: result.sk_kenaikan_pangkat ?? null,
      },
      pendidikan_terakhir: {
        nama_sekolah: result.nama_sekolah ?? null,
        no_ijazah: result.no_ijazah ?? null,
        tgl_ijazah: result.tgl_ijazah ? result.tgl_ijazah.toISOString() : null,
        tgl_lulus: result.tgl_lulus ? result.tgl_lulus.toISOString() : null,
      },
      teknis_operasional_penegak_hukum:
        result.teknis_operasional_penegak_hukum === '1'
          ? true
          : result.teknis_operasional_penegak_hukum === '0'
            ? false
            : null,
      jabatan: result.jabatan ?? null,
      surat_sehat_jasmani_rohani: {
        nama_rs: result.nama_rs ?? null,
        tgl_surat_rs: result.tgl_surat_rs
          ? result.tgl_surat_rs.toISOString()
          : null,
      },
      dp3: {
        tahun_1: tahun_1 ?? null,
        nilai_1: nilai_1 ? Number(nilai_1) : null,
        tahun_2: tahun_2 ?? null,
        nilai_2: nilai_2 ? Number(nilai_2) : null,
      },
    };
  }

  async findPpnsVerifikasiPnsById(id_data_ppns: number) {
    return this.prismaService.ppnsVerifikasiPpns.findFirst({
      where: { id_data_ppns: id_data_ppns },
    });
  }

  async createOrUpdateVerifikasiPpnsUpload(
    idTransaksi: number,
    dataUpload: {
      id_surat: number;
      id_ppns: number;
      file_type: string;
      original_name: string;
      keterangan?: string;
      s3_key: string;
      mime_type?: string;
      file_size?: number;
      status?: string;
    }[],
  ) {
    for (const d of dataUpload) {
      // skip kalau semua field file kosong/null
      if (!d.s3_key || !d.original_name) {
        console.log(`Skip update untuk file_type ${d.file_type}, data null`);
        continue;
      }

      // cek apakah record dengan id_transaksi + file_type sudah ada
      const existing = await this.prismaService.ppnsUpload.findFirst({
        where: {
          id_surat: idTransaksi,
          file_type: d.file_type,
        },
      });

      if (existing) {
        // update hanya dengan data baru (tidak overwrite dengan null)
        await this.prismaService.ppnsUpload.update({
          where: { id: existing.id },
          data: {
            id_surat: d.id_surat,
            id_ppns: d.id_ppns,
            file_type: this.cleanString(d.file_type) ?? existing.file_type,
            original_name:
              this.cleanString(d.original_name) ?? existing.original_name,
            status: this.normalizeStatus(d.status) ?? existing.status,
            keterangan: this.cleanString(d.keterangan) ?? existing.keterangan,
            s3_key: this.cleanString(d.s3_key) ?? existing.s3_key,
            mime_type: this.cleanString(d.mime_type) ?? existing.mime_type,
            file_size: d.file_size ?? 0,
            uploaded_at: new Date(),
          },
        });
      } else {
        // insert baru kalau belum ada sama sekali
        await this.prismaService.ppnsUpload.create({
          data: {
            id_surat: d.id_surat,
            id_ppns: d.id_ppns,
            file_type: this.cleanString(d.file_type) ?? '',
            original_name: this.cleanString(d.original_name) ?? '',
            status: this.normalizeStatus(d.status),
            keterangan: this.cleanString(d.keterangan),
            s3_key: this.cleanString(d.s3_key) ?? '',
            mime_type: this.cleanString(d.mime_type) ?? 'application/pdf',
            file_size: d.file_size ?? 0,
            uploaded_at: new Date(),
          },
        });
      }
    }

    return { message: 'Upload dokumen berhasil disimpan/diupdate' };
  }

  private normalizeStatus(status?: string): status_upload_ii | null {
    const allowed: status_upload_ii[] = [
      'pending',
      'sesuai',
      'tidakSesuai',
      'tolak',
    ];
    if (!status || !allowed.includes(status as status_upload_ii))
      return 'pending';
    return status as status_upload_ii;
  }

  private cleanString(value?: string | null): string | null {
    if (!value) return null;
    // hapus null byte
    return value.replace(/\x00/g, '').trim();
  }
}
