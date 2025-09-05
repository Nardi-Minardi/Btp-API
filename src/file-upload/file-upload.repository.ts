import { Injectable } from '@nestjs/common';
import { TbUpload, Prisma } from '.prisma/main-client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class FileUploadRepository {
  constructor(private readonly prismaService: PrismaService) {}

  create(data: Prisma.TbUploadCreateInput): Promise<TbUpload> {
    return this.prismaService.tbUpload.create({ data });
  }

  update(id: number, data: Partial<TbUpload>): Promise<TbUpload> {
    return this.prismaService.tbUpload.update({
      where: { id_file: id },
      data,
    });
  }

  findByFileTypeAndIdTransaksi(
    file_type: string,
    id_transaksi: number,
  ): Promise<TbUpload | null> {
    return this.prismaService.tbUpload.findFirst({
      where: { file_type, id_transaksi },
    });
  }
}
