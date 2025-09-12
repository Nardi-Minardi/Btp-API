export class CreateResponsePermohonanVerifikasiSuratDto {
  id: number | null;
  id_user:number | null;
  id_layanan:number | null;
  lembaga_kementerian:number | null;
  instansi:number | null;
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
}

export class CreateResponsePermohonanVerifikasiPpnsDataPnsDto {
  id: number | null;
  id_surat: number | null;
  identitas_pns: any | null;
  wilayah_kerja: any []; 
}

export class CreateResponsePermohonanVerifikasiPpnsVerifikasiPpnsDto {
  id: number | null;
  id_data_ppns: number | null;
  id_surat: number | null;
  masa_kerja: any | null;
  pendidikan_terakhir: any | null;
  teknis_operasional_penegak_hukum: string | null;
  jabatan: string | null;
  surat_sehat_jasmani_rohani: any | null;
  dp3: any | null;
}

export class CreateResponsePermohonanVerifikasiUploadDokumenPpnsDto {
  message: string;
}

export class CreateRequestSendVerifikatorDto {
  message: string;
}

export class CreateResponseSendVerifikatorDto {
  message: string;
}
