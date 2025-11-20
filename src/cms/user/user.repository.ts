import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class CmsUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUser({
    role_id,
    search,
    limit = 50,
    offset = 0,
  }: {
    role_id?: number;
    search?: string;
    limit?: number;
    offset?: number;
  }) {

    const whereClause: any = {
      AND: [{ OR: [{ is_active: true }, { is_active: null }] }],
    };

    if (role_id) {
      whereClause.AND.push({ role_id });
    }

    if (search) {
      whereClause.AND.push({
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    return this.prisma.m_users.findMany({
      where: whereClause,
      include: { m_roles: true, m_jabatan: true, m_instansi: true },
      take: limit,
      skip: offset,
    });
  }

  async countAllUser({
    role_id,
    search,
  }: {
    role_id?: number;
    search?: string;
  }) {
    const whereClause: any = {
      AND: [{ OR: [{ is_active: true }, { is_active: null }] }],
    };

    if (role_id) {
      whereClause.AND.push({ role_id });
    }

    if (search) {
      whereClause.AND.push({
        OR: [
          { full_name: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    return this.prisma.m_users.count({
      where: whereClause,
    });
  }
}
