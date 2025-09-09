import { z, ZodType } from 'zod';
import dayjs from 'dayjs';

export class PermohonanVerifikasiValidation {
  static readonly GET_PENDAFTARAN_PAGINATION: ZodType = z.object({
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

  static readonly CREATE_PERMOHONAN_VERIFIKASI_SURAT: ZodType = z.object({
    id_layanan:  z.string().min(1, 'id_layanan is required'),
    lembaga_kementerian: z.string().min(1, 'Lembaga/Kementerian is required'),
    instansi: z.string().min(1, 'Instansi is required'),
    tgl_surat: z
      .string()
      .trim()
      .refine(
        (val) => {
          if (!val) return true; // kosong → valid (nanti dicek di refine level root)
          return !isNaN(Date.parse(val));
        },
        { message: 'Tanggal Surat must be a valid date string' },
      )
      .transform((val) => (val ? dayjs(val).toDate() : undefined)),
    perihal: z.string().min(1, 'Perihal is required'),
    nama_pengusul: z.string().min(1, 'Nama Pengusul is required'),
    jabatan_pengusul: z.string().min(1, 'Jabatan Pengusul is required'),
    dok_surat_pernyataan: z
      .any()
      .optional()
      .refine(
        (file: Express.Multer.File | undefined) =>
          !file || file.mimetype === 'application/pdf',
        { message: 'dokumenAkta harus berupa PDF' },
      )
      .refine(
        (file: Express.Multer.File | undefined) =>
          !file || file.size <= 5 * 1024 * 1024,
        { message: 'Ukuran dokumenAkta maksimal 5 MB' },
      ),
  });

  static readonly CREATE_SEND_VERIFIKATOR: ZodType = z.object({
    id_surat: z.number(),
  });

  static readonly CREATE_CALON_PPNS_STEP1: ZodType = z.object({
    id_surat: z.number(),
    identitas_pns: z.object({
      nama: z.string().min(1, 'Nama is required'),
      nip: z.string().min(1, 'NIP is required'),
      nama_gelar: z.string().min(1, 'Nama Gelar is required'),
      jabatan: z.string().min(1, 'Jabatan is required'),
      pangkat_golongan: z.string().min(1, 'Pangkat Golongan is required'),
      jenis_kelamin: z.enum(['Laki-laki', 'Perempuan'], {
        message: 'Jenis Kelamin must be Laki-laki or Perempuan',
      }),
      agama: z.string().min(1, 'Agama is required'),
      nama_sekolah: z.string().min(1, 'Nama Sekolah is required'),
      gelar_terakhir: z.string().min(1, 'Gelar Terakhir is required'),
      no_ijazah: z.string().min(1, 'No Ijazah is required'),
      tgl_ijazah: z
        .string()
        .trim()
        .refine(
          (val) => {
            if (!val) return true; // kosong → valid (nanti dicek di refine level root)
            return !isNaN(Date.parse(val));
          },
          { message: 'Tanggal Ijazah must be a valid date string' },
        )
        .transform((val) => (val ? dayjs(val).toDate() : undefined)),
      tahun_lulus: z
        .number({ invalid_type_error: 'Tahun Lulus must be a number' })
        .int('Tahun Lulus must be an integer')
        .min(1900, 'Tahun Lulus must be at least 1900')
        .max(new Date().getFullYear(), 'Tahun Lulus cannot be in the future'),
    }),
    wilayah_kerja: z
      .array(
        z.object({
          provinsi_penempatan: z.string().min(1, 'Provinsi Penempatan is required'),
          kabupaten_penempatan: z.string().min(1, 'Kabupaten Penempatan is required'),
          unit_kerja: z.string().min(1, 'Unit Kerja is required'),
          penempatan_baru: z.boolean(),
          uu_dikawal: z
          .array(z.number().min(1, 'uu_dikawal is required'))
          .min(1, 'Minimal 1 uu_dikawal')
          .max(3, 'Maksimal 3 uu_dikawal'),
        }),
      )
      .min(1, 'Minimal harus ada 1 wilayah kerja'),
  });
}
