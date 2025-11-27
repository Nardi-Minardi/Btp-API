@api.model_create_multi
	def create(self, vals_list):
		res = super(HarvestActivity, self).create(vals_list)
		for record in res:
			# # Pencegahan Duplicate
			if record.mobile_ref:
				hv_env = self.search([('mobile_ref','=',record.mobile_ref),('state','=','draft'),('id','!=',res.id)])
				m_draft = hv_env.filtered(lambda ms: ms.state == 'draft')
				m_notdraft = hv_env.filtered(lambda ms: ms.state != 'draft')
				if m_notdraft:
					raise ValidationError('Record Ini Sudah Di Approve.')
				if m_draft:
					hv_env[0].unlink()

			record.name = self.env['ir.sequence'].next_by_code(
					'harvest.activity', sequence_date=record.harvest_date
				)
		return res

    def action_update_images(self, datas=None):
        result = []
        results = {}
        # _logger.info(type(datas))
        if not datas:
            return {'error':'data of ref and image is required !'}
        for data in datas:
            for ref, img in data.items():
                zcp_obj = self.env['zharvest.collection.point']
                harvest_tph_id = zcp_obj.search(
                    [('mobile_ref', '=', ref)], limit=1)
                if not harvest_tph_id or not img:
                    continue
                harvest_tph_id.image = img
                result.append(harvest_tph_id.id) \
                    if harvest_tph_id.id not in result else None
                # harvest_id = harvest_tph_id.harvest_line_id.harvest_id
                # _logger.info([ref, harvest_tph_id, harvest_id, len(img)])
                results.update({'id': result})
        return results

        def _get_query(self, obj):
		_select = """
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
				tph.name tph_name,
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
				COALESCE(wb.netto_weight_grade / sum(wli.jjg_qty), 0) AS bjr,
				fcb.netto_qty_wb AS jjg_wb
				
				
		"""

		_from = """
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
				


		"""
		# where clausul yang pertama --> account.internal_group IN ('income', 'expense') AND
		_where = """
			WHERE 
				hv.state IN ('done', 'approve')
				AND hv.harvest_date BETWEEN %s AND %s
				AND hv.company_id IN %s
		"""


		_group = """
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
		"""

		_order = """
			ORDER BY 
				harvest_date ASC, harvest_name ASC
		"""

		return _select, _from, _where, _group, _order