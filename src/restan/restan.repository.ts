import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';

@Injectable()
export class RestanRepository {
  constructor(private readonly prisma: PrismaService) {}

  // =============================
  //        FIND ALL RESTAN
  // =============================
  async findAllRestan(params: {
    start_date?: string;
    end_date?: string;
    company_ids: number[];
  }) {
    const { start_date, end_date, company_ids } = params;

    const companyList = company_ids.length ? company_ids.join(',') : null;

    // Build WHERE conditions
    const whereClauses = [
      `hv.state IN ('done', 'approve')`,
      `hv.company_id IN (${companyList})`,
    ];

    if (start_date && end_date) {
      whereClauses.push(
        `hv.harvest_date BETWEEN '${start_date}' AND '${end_date}'`,
      );
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT DISTINCT
          hv.name AS harvest_name,
          hv.harvest_date AS harvest_date,
          hcp.serial_number AS serial_number,
          employee.name AS employee_name,
          employee.registration_number AS employee_nik,
          kerani_panen.registration_number AS kerani_panen,
          mandor_panen.registration_number AS mandor_panen,
          mandor_1.registration_number AS mandor_1,
          department.name AS department_name,
          ou.code AS operating_unit_name,
          company.name AS company_name,
          block.code AS block_name,
          block.select_year AS tahun_tanam,
          area.name AS area,
          tph.name AS tph_name,
          spb.name AS spb_name,
          spb.date AS spb_date,
          wb.bon_trip AS spb_mobile,
          wb.name AS tiket_timbang,
          hcp.id AS harvest_collection_point_id,
          hcp.fruit_qty AS jjg_harvest,
          hcp.leaf_qty AS brondol_harvest,
          hcp.mobile_ref_tph AS mobile_ref,
          fcb.fruit_jjg AS jjg_spb,
          fcb.fruit_bron AS brondol_spb,
          wb.netto_weight_grade AS netto_wb,
          COALESCE(wb.netto_weight_grade / SUM(wli.jjg_qty), 0) AS bjr,
          fcb.netto_qty_wb AS jjg_wb
      FROM 
          zharvest_activity_line hal
          LEFT JOIN zharvest_activity hv ON hv.id = hal.harvest_id
          LEFT JOIN zharvest_collection_point hcp ON hcp.harvest_line_id = hal.id
          LEFT JOIN hr_employee employee ON employee.id = hal.employee_id
          LEFT JOIN hr_employee mandor_1 ON mandor_1.id = hv.head_foreman_id
          LEFT JOIN hr_employee mandor_panen ON mandor_panen.id = hv.harvest_foreman_id
          LEFT JOIN hr_employee kerani_panen ON kerani_panen.id = hv.harvest_user_id
          LEFT JOIN hr_department department ON department.id = hal.department_id
          LEFT JOIN res_company company ON company.id = hv.company_id
          LEFT JOIN operating_unit ou ON ou.id = hv.operating_unit_id
          LEFT JOIN zblock_master block ON block.id = hal.block_id
          LEFT JOIN zblock_area area ON area.id = block.area_id
          LEFT JOIN zmaster_tpn tph ON tph.id = hcp.tph_id
          LEFT JOIN zfruit_courier_block fcb ON hcp.mobile_ref_tph = fcb.mobile_ref_panen_tph
          LEFT JOIN zfruit_courier spb ON spb.id = fcb.fruit_courier_id
          LEFT JOIN zw_bridge wb ON spb.id = wb.fruit_courier_id
          LEFT JOIN zw_bridge_line wli ON wli.weighbridge_id = wb.id
      ${whereSQL}
      GROUP BY 
          hv.id,
          hcp.id,
          employee.id,
          kerani_panen.id,
          mandor_panen.id,
          mandor_1.id,
          department.id,
          ou.id,
          company.id,
          hal.id,
          tph.id,
          block.id,
          fcb.id,
          spb.id,
          wb.id,
          area.id
      ORDER BY 
          harvest_date ASC, harvest_name ASC
    `;
    return this.prisma.$queryRawUnsafe(sql);
  }

  // =============================
  //        COUNT RESTAN
  // =============================
  async countAllRestan(params: {
    start_date?: string;
    end_date?: string;
    company_ids: number[];
  }) {
    const { start_date, end_date, company_ids } = params;

    const companyList = company_ids.length ? company_ids.join(',') : '0';

    const whereClauses = [
      `hv.state IN ('done', 'approve')`,
      `hv.company_id IN (${companyList})`,
    ];

    if (start_date && end_date) {
      whereClauses.push(
        `hv.harvest_date BETWEEN '${start_date}' AND '${end_date}'`,
      );
    }

    const whereSQL =
      whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const sql = `
      SELECT COUNT(*) AS count FROM (
        SELECT hcp.id
        FROM zharvest_activity_line hal
          LEFT JOIN zharvest_activity hv ON hv.id = hal.harvest_id
          LEFT JOIN zharvest_collection_point hcp ON hcp.harvest_line_id = hal.id
        ${whereSQL}
        GROUP BY hv.id, hcp.id, hal.id
      ) AS subquery;
    `;

    const result: any = await this.prisma.$queryRawUnsafe(sql);

    return Number(result?.[0]?.count || 0);
  }
}
