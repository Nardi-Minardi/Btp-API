// src/utils/validateWilayah.ts
import { NotFoundException } from '@nestjs/common';

type Repository = {
  getProvinsi: (id: string | number) => Promise<any>;
  getKabupaten: (id: string | number) => Promise<any>;
  getKecamatan: (id: string | number) => Promise<any>;
  getKelurahan: (id: string | number) => Promise<any>;
};


type InformasiAlamat = {
  idProvinsi: number;
  idKabupaten: number;
  idKecamatan: number;
  idKelurahan: number;
};

export async function validateWilayah(
  repo: Repository,
  alamat: InformasiAlamat,
) {
  const provinsi = await repo.getProvinsi(alamat.idProvinsi);
  if (!provinsi) {
    throw new NotFoundException(
      `Provinsi dengan ID ${alamat.idProvinsi} tidak ditemukan di database`,
    );
  }

  const kabupaten = await repo.getKabupaten(alamat.idKabupaten);
  if (!kabupaten) {
    throw new NotFoundException(
      `Kabupaten dengan ID ${alamat.idKabupaten} tidak ditemukan di database`,
    );
  }

  const kecamatan = await repo.getKecamatan(alamat.idKecamatan);
  if (!kecamatan) {
    throw new NotFoundException(
      `Kecamatan dengan ID ${alamat.idKecamatan} tidak ditemukan di database`,
    );
  }

  const kelurahan = await repo.getKelurahan(alamat.idKelurahan);
  if (!kelurahan) {
    throw new NotFoundException(
      `Kelurahan dengan ID ${alamat.idKelurahan} tidak ditemukan di database`,
    );
  }

  return { provinsi, kabupaten, kecamatan, kelurahan };
}
