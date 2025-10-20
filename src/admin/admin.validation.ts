import { z, ZodType } from 'zod';
import dayjs from 'dayjs';

// Enums
export const statusEnum = z.enum(["diterima", "data baru"]);
export const verifikasiEnum = z.enum(["sesuai", "tidak sesuai", "tolak"]);

// Schema utama
export const PpnsVerifikasiDataSchema = z.object({
  id: z.number().int().optional(),
  id_surat: z.number().int().nullable().optional(),
  id_data_ppns: z.number().int().nullable().optional(),

  verifikasi_data: verifikasiEnum.nullable().optional(),
  keterangan_data: z.string().nullable().optional(),

  verifikasi_wilayah: verifikasiEnum.nullable().optional(),
  keterangan_wilayah: z.string().nullable().optional(),

  status_a: verifikasiEnum.nullable().optional(),
  keterangan_a: z.string().nullable().optional(),

  status_b: verifikasiEnum.nullable().optional(),
  keterangan_b: z.string().nullable().optional(),

  status_c: verifikasiEnum.nullable().optional(),
  keterangan_c: z.string().nullable().optional(),

  status_d: verifikasiEnum.nullable().optional(),
  keterangan_d: z.string().nullable().optional(),

  status_e: verifikasiEnum.nullable().optional(),
  keterangan_e: z.string().nullable().optional(),

  status_f: verifikasiEnum.nullable().optional(),
  keterangan_f: z.string().nullable().optional(),

  keterangan_verifikator: z.string().nullable().optional(),

  verifikator_by: z.number().int().nullable().optional(),

  status: statusEnum.nullable().optional(),
});

export class AdminValidation {
  static readonly GET_SURAT_PAGINATION: ZodType = z.object({
    search: z.string().optional(),
    page: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number(),
    ),
    limit: z.preprocess(
      (val) => (typeof val === 'string' ? Number(val) : val),
      z.number(),
    ),
    orderBy: z.string().optional(),
    orderDirection: z.enum(['asc', 'desc']).optional(),
    filters: z.record(z.any()).optional(),
  });

  static readonly PPNS_VERIFIKASI_DATA: ZodType = PpnsVerifikasiDataSchema;

}
