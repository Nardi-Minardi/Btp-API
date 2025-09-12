import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterPrismaService, PrismaService } from 'src/common/prisma.service';
import { Prisma, status_upload_ii } from '.prisma/main-client/client';
import { PpnsSurat } from '.prisma/main-client/client';
import {
  CreateResponsePermohonanVerifikasiPpnsDataPnsDto,
  CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto,
} from './dto/create.permohonan-verifikasi.dto';
import { PermohonanVerifikasiSuratPaginationDto } from './dto/get.permohonan-verifikasi.dto';
import { suratAllowedFields } from 'src/common/constants/surat.fields';

@Injectable()
export class PermohonanVerifikasiRepository {
  constructor(
    private readonly masterPrismaService: MasterPrismaService,
    private readonly prismaService: PrismaService,
  ) {}

  async countPermohonanVerifikasiSurat(
    search: string | undefined,
    userId: number | null,
  ): Promise<number> {
    // base where
    const where: any = {
      id_layanan: 1, // <<-- base condition
    };

    // filter userId hanya kalau ada
    if (userId) {
      where.created_by = userId;
    }

    // filter search hanya kalau ada
    if (search) {
      where.OR = [
        { no_surat: { contains: search, mode: 'insensitive' } },
        { perihal: { contains: search, mode: 'insensitive' } },
        { nama_pengusul: { contains: search, mode: 'insensitive' } },
        { jabatan_pengusul: { contains: search, mode: 'insensitive' } },
      ];
    }

    return this.prismaService.ppnsSurat.count({ where });
  }

  async findAllWithPaginationSurat(
    search: string | undefined,
    page: number,
    limit: number,
    orderBy: string | undefined = 'id',
    orderDirection: 'asc' | 'desc' = 'desc',
    filters?: Array<{ field: string; value: string }>,
    userId?: number | null,
  ): Promise<PermohonanVerifikasiSuratPaginationDto[]> {
    // validasi orderBy agar tidak SQL injection
    if (!suratAllowedFields.includes(orderBy)) {
      throw new BadRequestException(
        `Field orderBy '${orderBy}' tidak valid. Gunakan salah satu: ${suratAllowedFields.join(', ')}`,
      );
    }

    // base where
    const where: any = { id_layanan: 1 }; // default filter id_layanan
    if (userId != null) {
      where.created_by = Number(userId);
    }

    // --- global search ---
    if (search) {
      const orConditions: any[] = [];

      // cari di kolom string
      orConditions.push(
        { no_surat: { contains: search, mode: 'insensitive' } },
        { perihal: { contains: search, mode: 'insensitive' } },
        { nama_pengusul: { contains: search, mode: 'insensitive' } },
        { jabatan_pengusul: { contains: search, mode: 'insensitive' } },
      );

      // date search
      const parsedDate = new Date(search);
      if (!isNaN(parsedDate.getTime())) {
        orConditions.push({ tgl_surat: parsedDate });
      }

      where.OR = orConditions;
    }

     // --- filters ---
    if (filters && filters.length > 0) {
      const numberFields = ['lembaga_kementerian', 'instatnsi'];
      const stringFields = ['nama_pengusul', 'jabatan_pengusul', 'no_surat'];
      const enumFields = ['status'];

      const filterConditions: any[] = [];

      for (const filter of filters) {
        const { field, value } = filter;

        // number
        if (numberFields.includes(field) && !isNaN(Number(value))) {
          filterConditions.push({ [field]: Number(value) });
          continue;
        }

        // string
        if (stringFields.includes(field) && typeof value === 'string') {
          filterConditions.push({
            [field]: { contains: value, mode: 'insensitive' },
          });
          continue;
        }

        // enum: konversi label ke enum internal
        if (enumFields.includes(field)) {
          let enumValue: string | undefined;
          if (field === 'status') {
            if (value === 'true' || value === '1') enumValue = 'true';
            else if (value === 'false' || value === '0') enumValue = 'false';
          }

          if (enumValue) {
            filterConditions.push({ [field]: enumValue });
          } else {
            throw new BadRequestException(
              `Nilai filter untuk ${field} tidak valid: ${value}`,
            );
          }
        }
      }

      if (filterConditions.length > 0) {
        where.AND = filterConditions; // AND supaya semua filter cocok
      }
    }

    // --- eksekusi query ---
    const results = await this.prismaService.ppnsSurat.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderBy]: orderDirection },
    });

    // mapping hasil
    return results.map((item) => ({
      ...item,
      page: String(page),
      limit: String(limit),
    }));
  }

  async savePermohonanVerifikasiSurat(
    data: Prisma.PpnsSuratCreateInput,
  ): Promise<PpnsSurat> {
    return this.prismaService.ppnsSurat.create({
      data: {
        ...data,
      },
    });
  }

  async findPpnSuratById(id: number): Promise<Prisma.PpnsSuratGetPayload<{
    include: { ppns_data_pns: true; ppns_upload: true };
  }> | null> {
    return this.prismaService.ppnsSurat.findFirst({
      where: { id },
      include: {
        ppns_data_pns: true,
        ppns_upload: true,
      },
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

  async savePpnsDataPns(
    data: Prisma.PpnsDataPnsCreateInput,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsDataPnsDto> {
    const result = await this.prismaService.ppnsDataPns.create({
      data,
      include: {
        ppns_wilayah_kerja: true,
      },
    });

    // Mapping identitas_pns
    const identitasPns = {
      nama: result.nama,
      nip: result.nip,
      nama_gelar: result.nama_gelar,
      jabatan: result.jabatan,
      pangkat_golongan: result.pangkat_atau_golongan,
      jenis_kelamin: result.jenis_kelamin,
      agama: result.agama,
      nama_sekolah: result.nama_sekolah,
      gelar_terakhir: result.gelar_terakhir,
      no_ijazah: result.no_ijazah,
      tgl_ijazah: result.tgl_ijazah
        ? result.tgl_ijazah.toISOString().split('T')[0]
        : null,
      tahun_lulus: result.tahun_lulus,
    };

    // Mapping wilayah kerja
    const wilayahKerja = result.ppns_wilayah_kerja.map((w) => ({
      provinsi_penempatan: w.provinsi_penempatan,
      kabupaten_penempatan: w.kabupaten_penempatan,
      unit_kerja: w.unit_kerja,
      penempatan_baru: w.penempatan_baru === '1',
      uu_dikawal: [w.uu_dikawal_1, w.uu_dikawal_2, w.uu_dikawal_3].filter(
        (u): u is string => !!u,
      ),
    }));

    return {
      id: result.id,
      id_surat: result.id_surat,
      identitas_pns: identitasPns,
      wilayah_kerja: wilayahKerja,
    };
  }

  async findPpnsDataPnsByIdSurat(id_surat: number) {
    return this.prismaService.ppnsDataPns.findFirst({
      where: { id_surat },
      include: {
        ppns_wilayah_kerja: true,
      },
    });
  }

  async findPpnsDataPnsById(id: number) {
    return this.prismaService.ppnsDataPns.findFirst({
      where: { id },
      include: {
        ppns_wilayah_kerja: true,
      },
    });
  }


  async updatePpnsDataPns(
    id: number,
    data: Prisma.PpnsDataPnsUpdateInput,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsDataPnsDto> {
    const result = await this.prismaService.ppnsDataPns.update({
      where: { id },
      data,
      include: {
        ppns_wilayah_kerja: true,
      },
    });

    // Mapping identitas_pns
    const identitasPns = {
      nama: result.nama,
      nip: result.nip,
      nama_gelar: result.nama_gelar,
      jabatan: result.jabatan,
      pangkat_golongan: result.pangkat_atau_golongan,
      jenis_kelamin: result.jenis_kelamin,
      agama: result.agama,
      nama_sekolah: result.nama_sekolah,
      gelar_terakhir: result.gelar_terakhir,
      no_ijazah: result.no_ijazah,
      tgl_ijazah: result.tgl_ijazah
        ? result.tgl_ijazah.toISOString().split('T')[0]
        : null,
      tahun_lulus: result.tahun_lulus,
    };

    // Mapping wilayah kerja
    const wilayahKerja = result.ppns_wilayah_kerja.map((w) => ({
      provinsi_penempatan: w.provinsi_penempatan,
      kabupaten_penempatan: w.kabupaten_penempatan,
      unit_kerja: w.unit_kerja,
      penempatan_baru: w.penempatan_baru === '1',
      uu_dikawal: [w.uu_dikawal_1, w.uu_dikawal_2, w.uu_dikawal_3].filter(
        (u): u is string => !!u,
      ),
    }));

    return {
      id: result.id,
      id_surat: result.id_surat,
      identitas_pns: identitasPns,
      wilayah_kerja: wilayahKerja,
    };
  }

  async savePpnsVerifikasiPns(
    data: Prisma.PpnsVerifikasiPpnsCreateInput,
  ): Promise<CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto> {
    const result = await this.prismaService.ppnsVerifikasiPpns.create({
      data,
    });

    // Cari id_surat dari relasi
    let idSurat: number | null = null;
    if (typeof result.id_data_ppns === 'number') {
      const d = await this.findPpnsDataPnsById(result.id_data_ppns);
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
        result.teknis_operasional_penegak_hukum ?? null,
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
      const pnsData = await this.findPpnsDataPnsById(data.id_data_ppns);
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
        result.teknis_operasional_penegak_hukum ?? null,
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

  async updatePpnsUploadIdPpns(id_surat: number, id_ppns: number) {
    console.log('DEBUG updatePpnsUploadIdPpns:', { id_surat, id_ppns });

    const updated = await this.prismaService.ppnsUpload.updateMany({
      where: {
        id_surat,
        OR: [
          { id_ppns: null }, // kalau NULL
          { id_ppns: 0 }, // kalau default-nya 0
        ],
      },
      data: { id_ppns },
    });

    console.log('DEBUG update result:', updated);
    return updated;
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
