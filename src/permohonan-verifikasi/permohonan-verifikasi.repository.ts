import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterPrismaService, PrismaService } from 'src/common/prisma.service';
import { Prisma, status_upload_ii } from '.prisma/main-client/client';
import { PpnsSurat } from '.prisma/main-client/client';
import { CreateResponsePermohonanVerifikasiPpnsDataPnsDto } from './dto/create.permohonan-verifikasi.dto';

@Injectable()
export class PermohonanVerifikasiRepository {
  constructor(
    private readonly masterPrismaService: MasterPrismaService,
    private readonly prismaService: PrismaService,
  ) {}

  async savePermohonanVerifikasiSurat(
    data: Prisma.PpnsSuratCreateInput,
  ): Promise<PpnsSurat> {
    return this.prismaService.ppnsSurat.create({
      data: {
        ...data,
      },
    });
  }

  async findPpnSuratById(id: number): Promise<PpnsSurat | null> {
    return this.prismaService.ppnsSurat.findUnique({
      where: { id },
    });
  }

  async updateStatusPpnSurat(id: number, status: boolean): Promise<PpnsSurat> {
    await this.prismaService.ppnsSurat.findUnique({
      where: { id },
    });

    return this.prismaService.ppnsSurat.update({
      where: { id },
      data: { status },
    });
  }

  async savePermohonanVerifikasiPpnsDataPns(
    data: Prisma.PpnsDataPnsCreateInput,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsDataPnsDto> {
    const result = await this.prismaService.ppnsDataPns.create({
      data,
      include: {
        ppns_wilayah_kerja: true, // supaya ikut di-return
      },
    });

    return {
      ...result,
      tgl_ijazah: result.tgl_ijazah ? result.tgl_ijazah.toISOString() : null,
      tahun_lulus: result.tahun_lulus ? result.tahun_lulus.toString() : null,
    };
  }

  async findPpnDataPnsByIdSurat(id_surat: number) {
    return this.prismaService.ppnsDataPns.findFirst({
      where: { id_surat },
      include: {
        ppns_wilayah_kerja: true,
      },
    });
  }

  async updatePermohonanVerifikasiPpnsDataPns(
      id: number,
      data: Prisma.PpnsDataPnsUpdateInput,
    ) {
      return this.prismaService.ppnsDataPns.update({
        where: { id: id },
        data,
        include: {
          ppns_wilayah_kerja: true,
        },
      });
    }
  

  async createOrUpdatePpnsUpload(
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
