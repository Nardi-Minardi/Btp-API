export class NotarisPenggantiDto {
  id: number;
  nama: string | null;
  provinsi: string | null;
  idProvinsi: number | null;
}

export class ResponseNotarisPenggantiDto {
  countData: number;
  list: NotarisPenggantiDto[];
}
