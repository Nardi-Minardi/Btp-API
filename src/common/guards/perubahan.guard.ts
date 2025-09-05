import {
  CanActivate,
  ExecutionContext,
  HttpException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/common/prisma.service';
import { CHECK_OWNERSHIP_KEY } from '../decorators/ownership.decorator';

@Injectable()
export class PerubahanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prismaService: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request?.user;
    // console.log('PoliciesGuard user:', user);

    // Cek ownership?
    const checkOwnership = this.reflector.getAllAndOverride<boolean>(
      CHECK_OWNERSHIP_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (checkOwnership) {
      const { noSurat } = request.body; // param yg kamu kirim dari controller
      if (!noSurat) {
        throw new HttpException('noSurat is required', 400);
      }

      const [cv, firma, perdata] = await Promise.all([
        this.prismaService.transaksiCv.findFirst({
          where: { no_surat: noSurat },
          select: { created_by: true },
        }),
        this.prismaService.transaksiFirma.findFirst({
          where: { no_surat: noSurat },
          select: { created_by: true },
        }),
        this.prismaService.transaksiPerdata.findFirst({
          where: { no_surat: noSurat },
          select: { created_by: true },
        }),
      ]);

      const record = cv || firma || perdata;

      // console.log('Record', record);

      if (!record) {
        throw new HttpException(
          `Data dengan noPengajuan (${noSurat}) tidak ditemukan`,
          404,
        );
      }

      if (record?.created_by !== user?.user_id) {
        throw new HttpException(
          `Forbidden, Akses ditolak, Data dengan noSurat (${noSurat} created by ${record?.created_by}) bukan milik anda`,
          403,
        );
      }
    }

    return true;
  }
}
