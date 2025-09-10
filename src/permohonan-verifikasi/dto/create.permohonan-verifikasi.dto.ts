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
  nama: string | null;
  nip: string | null;
  nama_gelar: string | null;
  jabatan: string | null;
  pangkat_atau_golongan: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  nama_sekolah: string | null;
  gelar_terakhir: string | null;
  no_ijazah: string | null;
  tgl_ijazah: string | null; // ISO date string | null
  tahun_lulus: string | null;
  ppns_wilayah_kerja: any[];
}


export class CreateRequestSendVerifikatorDto {
  message: string;
}

export class CreateResponseSendVerifikatorDto {
  message: string;
}
