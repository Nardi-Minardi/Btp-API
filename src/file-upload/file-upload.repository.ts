import { Injectable } from '@nestjs/common';
import { PpnsUpload, Prisma } from '.prisma/main-client';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class FileUploadRepository {
  constructor(private readonly prismaService: PrismaService) {}

  createPpnsUpload(data: Prisma.PpnsUploadCreateInput): Promise<PpnsUpload> {
    return this.prismaService.ppnsUpload.create({ data });
  }

  updatePpnsUpload(id: number, data: Partial<PpnsUpload>): Promise<PpnsUpload> {
    return this.prismaService.ppnsUpload.update({
      where: { id: id },
      data,
    });
  }

  findFilePpnsUpload(
    file_type: string,
    id_surat: number,
    id_ppns: number,
  ): Promise<PpnsUpload | null> {
    return this.prismaService.ppnsUpload.findFirst({
      where: { file_type, id_surat, id_ppns },
    });
  }
}
