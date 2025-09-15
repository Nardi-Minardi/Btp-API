export class ListKementerianDto {
  id: number;
  nama: string | null;
  created_at: string | null;
  ppns_instansi: any[];
}

export class ListInstansiDto {
  id: number;
  id_kementerian: number | null;
  nama: string | null;
  created_at: string | null;
  ppns_kementerian: any | null;
}

export class ListLayananDto {
  id: number;
  nama: string | null;
  created_at: string | null;
}

export class ListDataPpnsDto {
  id: number;
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
  tgl_ijazah: string | null;
  data_baru: string | null;
  aktif: string | null;
}
