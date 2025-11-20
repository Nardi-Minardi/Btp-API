import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

export type CreateUserInput = {
  username: string;
  email: string;
  password: string;
  full_name?: string | null;
  jabatan?: string | null;
  role: 'SUPERADMIN' | 'ADMIN' | 'OPERATOR' | 'USER';
  instansi_id?: number | null;
  wilayah_kerja?: string[];
  is_active?: boolean | null;
};

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.m_users.findUnique({ where: { email } });
  }

  findByUsername(username: string) {
    return this.prisma.m_users.findFirst({ where: { username } });
  }

  findById(id: number) {
    const result = this.prisma.m_users.findUnique({
      where: { id },
      include: { m_roles: true, m_jabatan: true, m_instansi: true },
    });
    return result;
  }

  updateLastLogin(id: number) {
    return this.prisma.m_users.update({
      where: { id },
      data: { last_login: new Date() },
    });
  }
}
