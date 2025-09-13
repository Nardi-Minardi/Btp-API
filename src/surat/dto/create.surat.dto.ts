export class CreateResponseSuratDto {
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
  dok_surat_pernyataan?: any;
}

export class CreateResponsePpnsDataPnsDto {
  id: number | null;
  id_surat: number | null;
  identitas_pns: any | null;
  wilayah_kerja: any []; 
}


export class CreateResponseUploadDokumenPpnsDto {
  message: string;
}

export class CreateRequestSendVerifikatorDto {
  message: string;
}

export class CreateResponseSendVerifikatorDto {
  message: string;
}
