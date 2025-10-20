import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterPrismaService, PrismaService } from 'src/common/prisma.service';
import { Prisma, status_upload_ii } from '.prisma/main-client/client';
import { SuratRepository } from 'src/surat/surat.repository';
import { DaftarVerifikasiPaginationDto } from './dto/get.admin.dto';
import { suratAllowedFields } from 'src/common/constants/surat.fields';
@Injectable()
export class AdminRepository {
  constructor(
    private readonly masterPrismaService: MasterPrismaService,
    private readonly prismaService: PrismaService,
  ) {}

  async countDaftarVerifikasi(
    search: string | undefined,
    userId: number | null,
  ): Promise<number> {
    //base status = true
    const where: any = {
      status: true,
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

  async findAllWithDaftarVerifikasi(
    search: string | undefined,
    page: number,
    limit: number,
    orderBy: string | undefined = 'id',
    orderDirection: 'asc' | 'desc' = 'desc',
    filters?: Array<{ field: string; value: string }>,
    userId?: number | null,
  ): Promise<any[]> {
    // validasi orderBy agar tidak SQL injection
    if (!suratAllowedFields.includes(orderBy)) {
      throw new BadRequestException(
        `Field orderBy '${orderBy}' tidak valid. Gunakan salah satu: ${suratAllowedFields.join(', ')}`,
      );
    }

    const where: any = {
      status: true,
    };

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
      include: {
        ppns_kementerian: true,
        ppns_instansi: true,
        ppns_layanan: true,
      },
    });

    // mapping hasil
    return results.map((item) => ({
      ...item,
      page: String(page),
      limit: String(limit),
    }));
  }
}
