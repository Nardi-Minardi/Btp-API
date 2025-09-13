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
