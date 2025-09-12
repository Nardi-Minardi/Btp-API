import { Pagination } from "src/common/web.response";

export class PermohonanVerifikasiSuratPaginationDto {
  search?: string;
  page: string;
  limit: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export class GetPermohonanVerifikasiSuratPaginationDto {
  data: ListPermohonanVerifikasiSurat[];
  pagination: Pagination;
}

export class ListPermohonanVerifikasiSurat {
  id: number | null;
  id_user: number | null;
  lembaga_kementerian: number | null;
  instansi: number | null;
  no_surat: string | null;
  tgl_surat: string | null; // ISO date string
  perihal: string | null;
  nama_pengusul: string | null;
  jabatan_pengusul: string | null;
  status: boolean | null;
  created_at: string; // ISO date string
  created_by: number | null;
  verifikator_by: number | null;
  verifikator_at: string | null; // ISO date string | null
  id_layanan: number | null;
  // ppns_upload : any [];
  // ppns_data_pns : any [];
  // ppns_verifikasi_ppns : any [];
}