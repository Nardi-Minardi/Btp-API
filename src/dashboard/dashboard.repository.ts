import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listDas(provinsi_code?: string) {
    if (provinsi_code) {
      return this.prisma.$queryRaw<any[]>`
        SELECT 
          id, sungai_id, das_uid, kode_das, name, luas, ws_uid, color,
          CASE WHEN geom IS NULL THEN NULL ELSE ST_AsGeoJSON(geom)::json END as geom,
          created_at, updated_at, provinsi_code
        FROM m_das
        WHERE provinsi_code = ${provinsi_code}
        ORDER BY name ASC
      `;
    }
    return this.prisma.$queryRaw<any[]>`
      SELECT 
        id, sungai_id, das_uid, kode_das, name, luas, ws_uid, color,
        CASE WHEN geom IS NULL THEN NULL ELSE ST_AsGeoJSON(geom)::json END as geom,
        created_at, updated_at, provinsi_code
      FROM m_das
      ORDER BY name ASC
    `;
  }

  listDevices() {
    return this.prisma.m_device.findMany({ orderBy: { name: 'asc' } });
  }
}
