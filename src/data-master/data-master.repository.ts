import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MasterPrismaService, PrismaService } from 'src/common/prisma.service';
import { Kbli, NotarisPengganti, Prisma, Wilayah } from '.prisma/master-client';

@Injectable()
export class DataMasterRepository {
  constructor(
    private readonly masterPrismaService: MasterPrismaService,
    private readonly prismaService: PrismaService,
  ) {}

  async getNotarisPenggantiByNama(nama: string): Promise<NotarisPengganti[]> {
    const notarisPengganti =
      await this.masterPrismaService.notarisPengganti.findMany({
        where: {
          nama: {
            contains: nama,
            mode: 'insensitive',
          },
        },
      });

    if (!notarisPengganti.length) {
      throw new NotFoundException(
        `Notaris Pengganti with name ${nama} not found`,
      );
    }

    return notarisPengganti;
  }

  async countSearchNotarisPengganti(
    search: string | undefined,
  ): Promise<number> {
    let where;
    if (search)
      where = {
        OR: [
          {
            nama: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      };
    else where = {};

    return this.masterPrismaService.notarisPengganti.count({ where });
  }

  async getNotarisPenggantiById(
    idNotaris: number,
  ): Promise<NotarisPengganti | null> {
    const notaris = await this.masterPrismaService.notarisPengganti.findFirst({
      where: { id: idNotaris },
    });

    return notaris;
  }

  async getKbliById(idKbli: number): Promise<Kbli | null> {
    const kbli = await this.masterPrismaService.kbli.findFirst({
      where: { id_kbli: idKbli },
    });

    return kbli;
  }

  async getProvinsi(idProvinsi: string): Promise<Wilayah | null> {
    const provinsi = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idProvinsi },
    });

    return provinsi;
  }

  async getKabupaten(idKabupaten: string): Promise<Wilayah | null> {
    const kabupaten = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idKabupaten },
    });

    return kabupaten;
  }

  async getKecamatan(idKecamatan: string): Promise<Wilayah | null> {
    const kecamatan = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idKecamatan },
    });

    return kecamatan;
  }

  async getKelurahan(idKelurahan: string): Promise<Wilayah | null> {
    const kelurahan = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idKelurahan },
    });

    return kelurahan;
  }
}
