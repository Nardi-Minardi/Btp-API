import { Injectable, NotFoundException } from '@nestjs/common';
import { MasterPrismaService, PrismaService } from 'src/common/prisma.service';
import { Kbli, NotarisPengganti, Prisma, Wilayah } from '.prisma/master-client';
import { Instansi, Kementerian } from '.prisma/main-client/client';

@Injectable()
export class DataMasterRepository {
  constructor(
    private readonly masterPrismaService: MasterPrismaService,
    private readonly prismaService: PrismaService,
  ) {}

  async findNotarisPenggantiByNama(nama: string): Promise<NotarisPengganti[]> {
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

  async findNotarisPenggantiById(
    idNotaris: number,
  ): Promise<NotarisPengganti | null> {
    const notaris = await this.masterPrismaService.notarisPengganti.findFirst({
      where: { id: idNotaris },
    });

    return notaris;
  }

  async findKbliById(idKbli: number): Promise<Kbli | null> {
    const kbli = await this.masterPrismaService.kbli.findFirst({
      where: { id_kbli: idKbli },
    });

    return kbli;
  }

  async findProvinsiById(idProvinsi: string): Promise<Wilayah | null> {
    const provinsi = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idProvinsi },
    });

    return provinsi;
  }

  async findKabupatenById(idKabupaten: string): Promise<Wilayah | null> {
    const kabupaten = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idKabupaten },
    });

    return kabupaten;
  }

  async findKecamatanById(idKecamatan: string): Promise<Wilayah | null> {
    const kecamatan = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idKecamatan },
    });

    return kecamatan;
  }

  async findKelurahanById(idKelurahan: string): Promise<Wilayah | null> {
    const kelurahan = await this.masterPrismaService.wilayah.findFirst({
      where: { id: idKelurahan },
    });

    return kelurahan;
  }

  async findKementerianById(idKementerian: number): Promise<Kementerian | null> {
    const kementerian = await this.prismaService.kementerian.findFirst({
      where: { id: idKementerian },
      include: {  
        Instansi: true,
      },
    });
    return kementerian;
  }

  async findInstansiById(idKementerian: number): Promise<Instansi | null> {
    const instansi = await this.prismaService.instansi.findFirst({
      where: { id_kementerian: idKementerian },
      include: {
        Kementerian: true,
      },
    });
    return instansi;
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
}
