/* eslint-disable */
import { OrgEntityToOrgDto }                       from '@/views/Mapping/Organisation/index.js'
import { mapEntityToDto as substationEntityToDto }  from '@/views/Mapping/Substation/index.js'
import { volEntityToVolDto }                        from '@/views/Mapping/VoltageLevel/index.js'
import { transformerEntityToDto }                   from '@/views/Mapping/Transformer/index.js'
import { voltageTransformerEntityToDto }            from '@/views/Mapping/VoltageTransformer/index.js'
import { currentTransformerEntityToDto }            from '@/views/Mapping/CurrentTransformer/index.js'
import { breakerEntityToDto }                       from '@/views/Mapping/Breaker/index.js'
import { powerCableEntityToDto }                    from '@/views/Mapping/PowerCable/index.js'
import { surgeArresterEntityToDto }                 from '@/views/Mapping/SurgeArrester/index.js'
import { mapEntityToDto as reactorEntityToDto }     from '@/views/Mapping/Reactor/index.js'
import { mapEntityToDto as rotatingEntityToDto }    from '@/views/Mapping/RotatingMachine/index.js'
import { disconnectorEntityToDto }                  from '@/views/Mapping/Disconnector/index.js'
import { capacitorEntityToDto }                     from '@/views/Mapping/Capacitor/index.js'
import { bushingEntityToDto }                       from '@/views/Mapping/Bushing/index.js'
import { JobEntityToDto as transformerJobEntityToDto }    from '@/views/Mapping/TransformerJob/index.js'
import { JobEntityToDto as vtJobEntityToDto }             from '@/views/Mapping/VoltageTransformerJob/index.js'
import { JobEntityToDto as ctJobEntityToDto }             from '@/views/Mapping/CurrentTransformerJob/index.js'
import { JobEntityToDto as breakerJobEntityToDto }        from '@/views/Mapping/CircuitBreakerJob/index.js'
import { JobEntityToDto as cableJobEntityToDto }          from '@/views/Mapping/PowerCableJob/index.js'
import { JobEntityToDto as saJobEntityToDto }             from '@/views/Mapping/SurgerArresterJob/index.js'
import { JobEntityToDto as reactorJobEntityToDto }        from '@/views/Mapping/ReactorJob/index.js'
import { JobEntityToDto as rotatingJobEntityToDto }       from '@/views/Mapping/RotatingMachineJob/index.js'
import { JobEntityToDto as capacitorJobEntityToDto }      from '@/views/Mapping/CapacitorJob/index.js'
import { JobEntityToDto as disconnectorJobEntityToDto }   from '@/views/Mapping/DisconnectorJob/index.js'
import { JobEntityToDto as bushingJobEntityToDto }        from '@/views/Mapping/BushingJob/index.js'
import {ASSET_TYPE_TO_KEY, FEATURE_TREE } from '../../Common/constants'

const v = (obj) => (obj && obj.value !== undefined) ? String(obj.value ?? '') : String(obj ?? '')

// Empty result dùng khi không có data — nhất quán để destructure không bị undefined
const EMPTY_RESULT = { flatMap: {}, arrayMap: null }

export const exportService = {
  mapProps(p) {
    if (!p) return {}
    return { type: p.type||'', kind: p.kind||'', serial_no: p.serial_no||'', manufacturer: p.manufacturer||'', manufacturer_type: p.manufacturer_type||'', manufacturer_year: p.manufacturer_year||'', model: p.model||'', country_of_origin: p.country_of_origin||'', apparatus_id: p.apparatus_id||'', comment: p.comment||'' }
  },

  buildTestArrayMap(testList) {
    const arrayMap = {}
    if (!testList) return arrayMap

    for (const test of testList) {
      const tc = test.testTypeCode
      if (!tc || !test.data?.table) continue

      const tables = test.data.table
      const tableKeys = Object.keys(tables)
      const isMultiTable = tableKeys.length > 1

      for (const tableKey of tableKeys) {
        const rows = tables[tableKey] || []
        if (!rows.length) continue

        const colCodes = new Set()
        rows.forEach(row =>
          Object.keys(row)
            .filter(k => k !== 'mrid')
            .forEach(k => colCodes.add(k))
        )

        colCodes.forEach(col => {
          const key = isMultiTable ? `${tc}_${tableKey}_${col}` : `${tc}_${col}`
          arrayMap[key] = rows.map(row => {
            const cell = row[col]
            if (cell === undefined || cell === null) return ''
            if (typeof cell === 'object' && 'value' in cell) {
              const val = cell.value
              return (val !== null && val !== undefined) ? String(val) : ''
            }
            return String(cell)
          })
        })
      }

      const cond = test.testCondition?.condition || {}
      for (const [condCol, condCell] of Object.entries(cond)) {
        const key = `${tc}_cond_${condCol}`
        let val = ''
        if (condCell !== null && condCell !== undefined) {
          val = typeof condCell === 'object' && 'value' in condCell
            ? (condCell.value !== null && condCell.value !== undefined ? String(condCell.value) : '')
            : String(condCell)
        }
        arrayMap[key] = [val]
      }
    }
    return arrayMap
  },

  getNodeIdForCat(catKey, ctx) {
    if (!ctx) return null
    if (catKey === 'OrgEntityToOrgDto')   return ctx.organisation?.mrid   || null
    if (catKey === 'SubstationDto')        return ctx.substation?.mrid     || null
    if (catKey === 'VoltageLevelDto')      return ctx.voltageLevel?.mrid   || null
    if (catKey === 'Bay')                  return ctx.bay?.mrid            || null
    if (catKey.startsWith('Asset_')) {
      if (!ctx.asset) return null
      const expectedKey = ASSET_TYPE_TO_KEY[ctx.asset.assetType]
      return catKey === expectedKey ? ctx.asset.mrid : null
    }
    if (catKey.startsWith('Job_')) {
      if (!ctx.job) return null
      const jobKey = catKey.startsWith('Job_Job_') ? catKey.slice(4) : catKey
      const jobTypeMap = {
        'Job_TransformerJobDto': 'Transformer', 'Job_VoltageTransformerJobDto': 'Voltage transformer',
        'Job_CurrentTransformerJobDto': 'Current transformer', 'Job_CircuitBreakerJobDto': 'Circuit breaker',
        'Job_PowerCableJobDto': 'Power cable', 'Job_SurgeArresterJobDto': 'Surge arrester',
        'Job_ReactorJobDto': 'Reactor', 'Job_CapacitorJobDto': 'Capacitor',
        'Job_DisconnectorJobDto': 'Disconnector', 'Job_RotatingMachineJobDto': 'Rotating machine',
        'Job_BushingJobDto': 'Bushing',
      }
      const expectedAsset = jobTypeMap[jobKey]
      return ctx.job.assetType === expectedAsset ? ctx.job.mrid : null
    }
    return null
  },

  async buildDtoForCat(cat, ctx) {
    const nodeId = this.getNodeIdForCat(cat.key, ctx)
    // FIX: trả về EMPTY_RESULT nhất quán thay vì {} để destructure không bị undefined
    if (!nodeId) return EMPTY_RESULT
    try {
      let flatMap = {}
      let arrayMap = null
      if (cat.key === 'OrgEntityToOrgDto') {
        const rs = await window.electronAPI.getOrganisationEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = OrgEntityToOrgDto(rs.data)
        flatMap = { name: dto.name||'', aliasName: dto.aliasName||'', tax_code: dto.tax_code||'', street: dto.street||'', ward_or_commune: dto.ward_or_commune||'', district_or_town: dto.district_or_town||'', city: dto.city||'', state_or_province: dto.state_or_province||'', postal_code: dto.postal_code||'', country: dto.country||'', phoneNumber: dto.phoneNumber||'', fax: dto.fax||'', email: dto.email||'', comment: dto.comment||'', pos_x: (dto.positionPoints?.x||[]).map(p=>p.coor).join(', '), pos_y: (dto.positionPoints?.y||[]).map(p=>p.coor).join(', '), pos_z: (dto.positionPoints?.z||[]).map(p=>p.coor).join(', ') }
      }
      else if (cat.key === 'SubstationDto') {
        const rs = await window.electronAPI.getSubstationEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = substationEntityToDto(rs.data)
        flatMap = { name: dto.name||'', aliasName: dto.aliasName||'', type: dto.type||'', generation: dto.generation||'', industry: dto.industry||'', locationName: dto.locationName||'', street: dto.street||'', ward_or_commune: dto.ward_or_commune||'', district_or_town: dto.district_or_town||'', state_or_province: dto.state_or_province||'', city: dto.city||'', country: dto.country||'', personName: dto.personName||'', department: dto.department||'', position: dto.position||'', phoneNumber: dto.phoneNumber||'', fax: dto.fax||'', email: dto.email||'', comment: dto.comment||'', pos_x: (dto.positionPoints?.x||[]).map(p=>p.coor).join(', '), pos_y: (dto.positionPoints?.y||[]).map(p=>p.coor).join(', '), pos_z: (dto.positionPoints?.z||[]).map(p=>p.coor).join(', ') }
      }
      else if (cat.key === 'VoltageLevelDto') {
        const rs = await window.electronAPI.getVoltageLevelEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = volEntityToVolDto(rs.data)
        flatMap = { name: dto.name||'', comment: dto.comment||'', high_voltage_limit_value: dto.high_voltage_limit_value||'', low_voltage_limit_value: dto.low_voltage_limit_value||'', base_voltage_value: dto.base_voltage_value||'' }
      }
      else if (cat.key === 'Bay') {
        const rs = await window.electronAPI.getBayEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const e = rs.data
        // FIX: dùng snake_case nhất quán, bay entity từ DB luôn là snake_case
        flatMap = { name: e.name||'', aliasName: e.aliasName||'', breaker_configuration: e.breaker_configuration||'', bus_bar_configuration: e.bus_bar_configuration||'' }
      }
      else if (cat.key === 'Asset_TransformerDataDto') {
        const rs = await window.electronAPI.getTransformerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = transformerEntityToDto(rs.data)
        const r = dto.ratings||{}, imp = dto.impedances||{}, oth = dto.others||{}, tc = dto.tap_changers||{}, wc = dto.winding_configuration||{}
        flatMap = { ...this.mapProps(dto.properties), phases: wc.phases||'', vector_group_custom: wc.vector_group_custom||'', unsupported_vector_group: wc.unsupported_vector_group||'', vector_group_data: wc.vector_group_data||'', rated_frequency: v(r.rated_frequency), short_circuit_ka: v(r.short_circuit?.ka), short_circuit_s: v(r.short_circuit?.s), category: oth.category||'', status: oth.status||'', tank_type: oth.tank_type||'', insulation_medium: oth.insulation_medium||'', total_weight: v(oth.total_weight), insulation_weight: v(oth.insulation?.weight), insulation_volume: v(oth.insulation?.volume), winding_prim: oth.winding?.prim||'', winding_sec: oth.winding?.sec||'', winding_tert: oth.winding?.tert||'', tap_mode: tc.mode||'', tap_serial_no: tc.serial_no||'', tap_manufacturer: tc.manufacturer||'', tap_manufacturer_type: tc.manufacturer_type||'', tap_winding: tc.winding||'', tap_scheme: tc.tap_scheme||'', no_of_taps: String(tc.no_of_taps||''), ref_temp: v(imp.ref_temp), zsi_base_power: v(imp.zero_sequence_impedance?.base_power?.data), zsi_base_voltage: v(imp.zero_sequence_impedance?.base_voltage?.data), zsi_zero: v(imp.zero_sequence_impedance?.zero_percent?.zero?.data), zsi_prim: v(imp.zero_sequence_impedance?.zero_percent?.prim?.data), zsi_sec: v(imp.zero_sequence_impedance?.zero_percent?.sec?.data) }
        arrayMap = {
          vr_winding:            (r.voltage_ratings||[]).map(x => x.winding||''),
          vr_voltage_ll:         (r.voltage_ratings||[]).map(x => v(x.voltage_ll)),
          vr_voltage_ln:         (r.voltage_ratings||[]).map(x => v(x.voltage_ln)),
          vr_insul_level_ll:     (r.voltage_ratings||[]).map(x => v(x.insul_level_ll)),
          vr_insulation_class:   (r.voltage_ratings||[]).map(x => x.insulation_class||''),
          vr_voltage_regulation: (r.voltage_ratings||[]).map(x => x.voltage_regulation||''),
          pr_rated_power:        (r.power_ratings||[]).map(x => v(x.rated_power)),
          pr_cooling_class:      (r.power_ratings||[]).map(x => x.cooling_class||''),
          pr_temp_rise_wind:     (r.power_ratings||[]).map(x => v(x.temp_rise_wind)),
          cr_prim:               (r.current_ratings||[]).map(x => v(x.prim?.data)),
          cr_sec:                (r.current_ratings||[]).map(x => v(x.sec?.data)),
          cr_tert:               (r.current_ratings||[]).map(x => v(x.tert?.data)),
          ps_uk:                 (imp.prim_sec||[]).map(x => v(x.short_circuit_impedances_uk)),
          ps_base_power:         (imp.prim_sec||[]).map(x => v(x.base_power?.data)),
          ps_base_voltage:       (imp.prim_sec||[]).map(x => v(x.base_voltage?.data)),
          ps_load_losses:        (imp.prim_sec||[]).map(x => v(x.load_losses_pk)),
          pt_uk:                 (imp.prim_tert||[]).map(x => v(x.short_circuit_impedances_uk)),
          pt_base_power:         (imp.prim_tert||[]).map(x => v(x.base_power?.data)),
          pt_base_voltage:       (imp.prim_tert||[]).map(x => v(x.base_voltage?.data)),
          pt_load_losses:        (imp.prim_tert||[]).map(x => v(x.load_losses_pk)),
          st_uk:                 (imp.sec_tert||[]).map(x => v(x.short_circuit_impedances_uk)),
          st_base_power:         (imp.sec_tert||[]).map(x => v(x.base_power?.data)),
          st_base_voltage:       (imp.sec_tert||[]).map(x => v(x.base_voltage?.data)),
          st_load_losses:        (imp.sec_tert||[]).map(x => v(x.load_losses_pk)),
          bushing_prim_pos:                (dto.bushing_data?.prim||[]).map(x => String(x.pos||'')),
          bushing_prim_asset_type:         (dto.bushing_data?.prim||[]).map(x => x.asset_type||''),
          bushing_prim_serial_no:          (dto.bushing_data?.prim||[]).map(x => x.serial_no||''),
          bushing_prim_manufacturer:       (dto.bushing_data?.prim||[]).map(x => x.manufacturer||''),
          bushing_prim_manufacturer_type:  (dto.bushing_data?.prim||[]).map(x => x.manufacturer_type||''),
          bushing_prim_manufacturer_year:  (dto.bushing_data?.prim||[]).map(x => x.manufacturer_year||''),
          bushing_prim_insulation_level:   (dto.bushing_data?.prim||[]).map(x => v(x.insulation_level)),
          bushing_prim_voltage_l_ground:   (dto.bushing_data?.prim||[]).map(x => v(x.voltage_l_ground)),
          bushing_prim_max_system_voltage: (dto.bushing_data?.prim||[]).map(x => v(x.max_system_voltage)),
          bushing_prim_rate_current:       (dto.bushing_data?.prim||[]).map(x => v(x.rate_current)),
          bushing_prim_df_c1:              (dto.bushing_data?.prim||[]).map(x => v(x.df_c1)),
          bushing_prim_cap_c1:             (dto.bushing_data?.prim||[]).map(x => v(x.cap_c1)),
          bushing_prim_df_c2:              (dto.bushing_data?.prim||[]).map(x => v(x.df_c2)),
          bushing_prim_cap_c2:             (dto.bushing_data?.prim||[]).map(x => v(x.cap_c2)),
          bushing_prim_insulation_type:    (dto.bushing_data?.prim||[]).map(x => x.insulation_type||''),
          bushing_sec_pos:                (dto.bushing_data?.sec||[]).map(x => String(x.pos||'')),
          bushing_sec_asset_type:         (dto.bushing_data?.sec||[]).map(x => x.asset_type||''),
          bushing_sec_serial_no:          (dto.bushing_data?.sec||[]).map(x => x.serial_no||''),
          bushing_sec_manufacturer:       (dto.bushing_data?.sec||[]).map(x => x.manufacturer||''),
          bushing_sec_manufacturer_type:  (dto.bushing_data?.sec||[]).map(x => x.manufacturer_type||''),
          bushing_sec_manufacturer_year:  (dto.bushing_data?.sec||[]).map(x => x.manufacturer_year||''),
          bushing_sec_insulation_level:   (dto.bushing_data?.sec||[]).map(x => v(x.insulation_level)),
          bushing_sec_voltage_l_ground:   (dto.bushing_data?.sec||[]).map(x => v(x.voltage_l_ground)),
          bushing_sec_max_system_voltage: (dto.bushing_data?.sec||[]).map(x => v(x.max_system_voltage)),
          bushing_sec_rate_current:       (dto.bushing_data?.sec||[]).map(x => v(x.rate_current)),
          bushing_sec_df_c1:              (dto.bushing_data?.sec||[]).map(x => v(x.df_c1)),
          bushing_sec_cap_c1:             (dto.bushing_data?.sec||[]).map(x => v(x.cap_c1)),
          bushing_sec_df_c2:              (dto.bushing_data?.sec||[]).map(x => v(x.df_c2)),
          bushing_sec_cap_c2:             (dto.bushing_data?.sec||[]).map(x => v(x.cap_c2)),
          bushing_sec_insulation_type:    (dto.bushing_data?.sec||[]).map(x => x.insulation_type||''),
          bushing_tert_pos:                (dto.bushing_data?.tert||[]).map(x => String(x.pos||'')),
          bushing_tert_asset_type:         (dto.bushing_data?.tert||[]).map(x => x.asset_type||''),
          bushing_tert_serial_no:          (dto.bushing_data?.tert||[]).map(x => x.serial_no||''),
          bushing_tert_manufacturer:       (dto.bushing_data?.tert||[]).map(x => x.manufacturer||''),
          bushing_tert_manufacturer_type:  (dto.bushing_data?.tert||[]).map(x => x.manufacturer_type||''),
          bushing_tert_manufacturer_year:  (dto.bushing_data?.tert||[]).map(x => x.manufacturer_year||''),
          bushing_tert_insulation_level:   (dto.bushing_data?.tert||[]).map(x => v(x.insulation_level)),
          bushing_tert_voltage_l_ground:   (dto.bushing_data?.tert||[]).map(x => v(x.voltage_l_ground)),
          bushing_tert_max_system_voltage: (dto.bushing_data?.tert||[]).map(x => v(x.max_system_voltage)),
          bushing_tert_rate_current:       (dto.bushing_data?.tert||[]).map(x => v(x.rate_current)),
          bushing_tert_df_c1:              (dto.bushing_data?.tert||[]).map(x => v(x.df_c1)),
          bushing_tert_cap_c1:             (dto.bushing_data?.tert||[]).map(x => v(x.cap_c1)),
          bushing_tert_df_c2:              (dto.bushing_data?.tert||[]).map(x => v(x.df_c2)),
          bushing_tert_cap_c2:             (dto.bushing_data?.tert||[]).map(x => v(x.cap_c2)),
          bushing_tert_insulation_type:    (dto.bushing_data?.tert||[]).map(x => x.insulation_type||''),
          sa_prim_serial_no:           (dto.surge_arrester?.prim||[]).map(x => x.properties?.serial_no||''),
          sa_prim_manufacturer:        (dto.surge_arrester?.prim||[]).map(x => x.properties?.manufacturer||''),
          sa_prim_manufacturer_year:   (dto.surge_arrester?.prim||[]).map(x => x.properties?.manufacturer_year||''),
          sa_prim_asset_system_code:   (dto.surge_arrester?.prim||[]).map(x => x.properties?.asset_system_code||''),
          sa_prim_unit:                (dto.surge_arrester?.prim||[]).map(x => String(x.ratings?.unit||'')),
          sa_prim_table_serial:        (dto.surge_arrester?.prim||[]).map(x => x.ratings?.table?.[0]?.serial||''),
          sa_prim_table_voltageLl:     (dto.surge_arrester?.prim||[]).map(x => v(x.ratings?.table?.[0]?.voltageLl)),
          sa_prim_table_voltageLn:     (dto.surge_arrester?.prim||[]).map(x => v(x.ratings?.table?.[0]?.voltageLn)),
          sa_prim_table_mcovRating:    (dto.surge_arrester?.prim||[]).map(x => v(x.ratings?.table?.[0]?.mcovRating)),
          sa_sec_serial_no:           (dto.surge_arrester?.sec||[]).map(x => x.properties?.serial_no||''),
          sa_sec_manufacturer:        (dto.surge_arrester?.sec||[]).map(x => x.properties?.manufacturer||''),
          sa_sec_manufacturer_year:   (dto.surge_arrester?.sec||[]).map(x => x.properties?.manufacturer_year||''),
          sa_sec_asset_system_code:   (dto.surge_arrester?.sec||[]).map(x => x.properties?.asset_system_code||''),
          sa_sec_unit:                (dto.surge_arrester?.sec||[]).map(x => String(x.ratings?.unit||'')),
          sa_sec_table_serial:        (dto.surge_arrester?.sec||[]).map(x => x.ratings?.table?.[0]?.serial||''),
          sa_sec_table_voltageLl:     (dto.surge_arrester?.sec||[]).map(x => v(x.ratings?.table?.[0]?.voltageLl)),
          sa_sec_table_voltageLn:     (dto.surge_arrester?.sec||[]).map(x => v(x.ratings?.table?.[0]?.voltageLn)),
          sa_sec_table_mcovRating:    (dto.surge_arrester?.sec||[]).map(x => v(x.ratings?.table?.[0]?.mcovRating)),
          sa_tert_serial_no:           (dto.surge_arrester?.tert||[]).map(x => x.properties?.serial_no||''),
          sa_tert_manufacturer:        (dto.surge_arrester?.tert||[]).map(x => x.properties?.manufacturer||''),
          sa_tert_manufacturer_year:   (dto.surge_arrester?.tert||[]).map(x => x.properties?.manufacturer_year||''),
          sa_tert_asset_system_code:   (dto.surge_arrester?.tert||[]).map(x => x.properties?.asset_system_code||''),
          sa_tert_unit:                (dto.surge_arrester?.tert||[]).map(x => String(x.ratings?.unit||'')),
          sa_tert_table_serial:        (dto.surge_arrester?.tert||[]).map(x => x.ratings?.table?.[0]?.serial||''),
          sa_tert_table_voltageLl:     (dto.surge_arrester?.tert||[]).map(x => v(x.ratings?.table?.[0]?.voltageLl)),
          sa_tert_table_voltageLn:     (dto.surge_arrester?.tert||[]).map(x => v(x.ratings?.table?.[0]?.voltageLn)),
          sa_tert_table_mcovRating:    (dto.surge_arrester?.tert||[]).map(x => v(x.ratings?.table?.[0]?.mcovRating)),
        }
      }
      else if (cat.key === 'Asset_VoltageTransformerDto') {
        const rs = await window.electronAPI.getVoltageTransformerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = voltageTransformerEntityToDto(rs.data); const r = dto.ratings||{}, cfg = dto.vt_Configuration||{}
        flatMap = { ...this.mapProps(dto.properties), standard: r.standard||'', rated_frequency: v(r.rated_frequency), upr: String(r.upr||''), rated_voltage: v(r.rated_voltage), c1: v(r.c1), c2: v(r.c2), windings: String(cfg.windings||'') }
        arrayMap = {
          usr_formula:        (cfg.dataVT||[]).map(x => x.usr_formula||''),
          usr_rated_voltage:  (cfg.dataVT||[]).map(x => v(x.usr_rated_voltage)),
          rated_burden:       (cfg.dataVT||[]).map(x => v(x.rated_burden)),
          rated_power_factor: (cfg.dataVT||[]).map(x => String(x.rated_power_factor||'')),
        }
      }
      else if (cat.key === 'Asset_CurrentTransformerDto') {
        const rs = await window.electronAPI.getCurrentTransformerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = currentTransformerEntityToDto(rs.data); const r = dto.ratings||{}, cfg = dto.ctConfiguration||{}
        flatMap = { ...this.mapProps(dto.properties), standard: v(r.standard), rated_frequency: v(r.rated_frequency), primary_winding_count: String(r.primary_winding_count||''), um_rms: v(r.um_rms), u_withstand_rms: v(r.u_withstand_rms), u_lightning_peak: v(r.u_lightning_peak), icth: v(r.icth), idyn_peak: v(r.idyn_peak), ith_rms: v(r.ith_rms), ith_duration: v(r.ith_duration), system_voltage: v(r.system_voltage), bil: v(r.bil), rating_factor: String(r.rating_factor||''), ct_cores: String(cfg.cores||'') }
        const d = cfg.dataCT || []
        arrayMap = {
          ct_taps:        d.map(x => String(x.taps||'')),
          ct_commonTap:   d.map(x => String(x.commonTap||'')),
          ct_fulltap_name:  d.map(x => x.fullTap?.table?.name||''),
          ct_fulltap_ipn:   d.map(x => v(x.fullTap?.table?.ipn)),
          ct_fulltap_isn:   d.map(x => v(x.fullTap?.table?.isn)),
          ct_fulltap_inuse: d.map(x => String(x.fullTap?.table?.inUse||false)),
          ct_class_app:           d.map(x => x.fullTap?.classRating?.app||''),
          ct_class:               d.map(x => x.fullTap?.classRating?.class||''),
          ct_class_wr:            d.map(x => v(x.fullTap?.classRating?.wr)),
          ct_class_kx:            d.map(x => String(x.fullTap?.classRating?.kx||'')),
          ct_class_re20lsn:       d.map(x => String(x.fullTap?.classRating?.re20lsn||'')),
          ct_class_k:             d.map(x => String(x.fullTap?.classRating?.k||'')),
          ct_class_fs:            d.map(x => String(x.fullTap?.classRating?.fs||'')),
          ct_class_kssc:          d.map(x => String(x.fullTap?.classRating?.kssc||'')),
          ct_class_ktd:           d.map(x => String(x.fullTap?.classRating?.ktd||'')),
          ct_class_duty:          d.map(x => x.fullTap?.classRating?.duty||''),
          ct_class_vb:            d.map(x => v(x.fullTap?.classRating?.vb)),
          ct_class_alf:           d.map(x => String(x.fullTap?.classRating?.alf||'')),
          ct_class_ts:            d.map(x => String(x.fullTap?.classRating?.ts||'')),
          ct_class_ek:            d.map(x => String(x.fullTap?.classRating?.ek||'')),
          ct_class_le:            d.map(x => String(x.fullTap?.classRating?.le||'')),
          ct_class_e1:            d.map(x => String(x.fullTap?.classRating?.e1||'')),
          ct_class_le1:           d.map(x => String(x.fullTap?.classRating?.le1||'')),
          ct_class_val:           d.map(x => String(x.fullTap?.classRating?.val||'')),
          ct_class_lal:           d.map(x => String(x.fullTap?.classRating?.lal||'')),
          ct_class_t1:            d.map(x => String(x.fullTap?.classRating?.t1||'')),
          ct_class_tal1:          d.map(x => String(x.fullTap?.classRating?.tal1||'')),
          ct_class_tp:            d.map(x => String(x.fullTap?.classRating?.tp||'')),
          ct_class_tpts:          d.map(x => String(x.fullTap?.classRating?.tpts||'')),
          ct_class_vk:            d.map(x => String(x.fullTap?.classRating?.vk||'')),
          ct_class_lk:            d.map(x => String(x.fullTap?.classRating?.lk||'')),
          ct_class_vk1:           d.map(x => String(x.fullTap?.classRating?.vk1||'')),
          ct_class_lk1:           d.map(x => String(x.fullTap?.classRating?.lk1||'')),
          ct_class_rated_burden:  d.map(x => v(x.fullTap?.classRating?.rated_burden)),
          ct_class_burden:        d.map(x => v(x.fullTap?.classRating?.burden)),
          ct_class_burden_cos:    d.map(x => String(x.fullTap?.classRating?.burdenCos||'')),
          ct_class_op_burden:     d.map(x => v(x.fullTap?.classRating?.operatingBurden)),
          ct_class_op_burden_cos: d.map(x => String(x.fullTap?.classRating?.operatingBurdenCos||'')),
          ct_main_ipn:           d.map(x => v(x.mainTap?.data?.[0]?.table?.ipn)),
          ct_main_isn:           d.map(x => v(x.mainTap?.data?.[0]?.table?.isn)),
          ct_main_rated_burden:  d.map(x => v(x.mainTap?.data?.[0]?.classRating?.rated_burden)),
          ct_main_burden:        d.map(x => v(x.mainTap?.data?.[0]?.classRating?.burden)),
          ct_main_burden_cos:    d.map(x => String(x.mainTap?.data?.[0]?.classRating?.burdenCos||'')),
          ct_main_op_burden:     d.map(x => v(x.mainTap?.data?.[0]?.classRating?.operatingBurden)),
          ct_main_op_burden_cos: d.map(x => String(x.mainTap?.data?.[0]?.classRating?.operatingBurdenCos||'')),
          ct_inter_ipn:           d.map(x => v(x.interTap?.data?.[0]?.table?.ipn)),
          ct_inter_isn:           d.map(x => v(x.interTap?.data?.[0]?.table?.isn)),
          ct_inter_rated_burden:  d.map(x => v(x.interTap?.data?.[0]?.classRating?.rated_burden)),
          ct_inter_burden:        d.map(x => v(x.interTap?.data?.[0]?.classRating?.burden)),
          ct_inter_burden_cos:    d.map(x => String(x.interTap?.data?.[0]?.classRating?.burdenCos||'')),
          ct_inter_op_burden:     d.map(x => v(x.interTap?.data?.[0]?.classRating?.operatingBurden)),
          ct_inter_op_burden_cos: d.map(x => String(x.interTap?.data?.[0]?.classRating?.operatingBurdenCos||'')),
        }
      }
      else if (cat.key === 'Asset_CircuitBreakerDto') {
        // FIX: đúng channel name là getBreakerEntityByMrid, không phải getCircuitBreakerEntityByMrid
        const rs = await window.electronAPI.getBreakerEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = breakerEntityToDto(rs.data); const cb = dto.circuitBreaker||{}, r = dto.ratings||{}, cs = dto.contactSystem||{}, oth = dto.others||{}, op = dto.operating||{}
        flatMap = { ...this.mapProps(dto.properties), numberOfPhases: String(cb.numberOfPhases||''), interruptersPerPhase: String(cb.interruptersPerPhase||''), poleOperation: cb.poleOperation||'', hasPIR: String(cb.hasPIR||''), pirValue: v(cb.pirValue), hasGradingCapacitors: String(cb.hasGradingCapacitors||''), capacitorValue: v(cb.capacitorValue), interruptingMedium: cb.interruptingMedium||'', tankType: cb.tankType||'', rated_voltage_ll: v(r.rated_voltage_ll), rated_current: v(r.rated_current), rated_frequency: v(r.rated_frequency), rated_short_circuit_breaking_current: v(r.rated_short_circuit_breaking_current), short_circuit_nominal_duration: v(r.short_circuit_nominal_duration), rated_insulation_level: v(r.rated_insulation_level), rated_interrupting_time: v(r.rated_interrupting_time), interrupting_duty_cycle: String(r.interrupting_duty_cycle||''), rated_power_at_closing: v(r.rated_power_at_closing), rated_power_at_opening: v(r.rated_power_at_opening), rated_power_at_motor_charge: v(r.rated_power_at_motor_charge), nominal_total_travel: v(cs.nominal_total_travel), damping_time: v(cs.damping_time), nozzle_length: v(cs.nozzle_length), total_weight_with_gas: v(oth.total_weight_with_gas), weight_of_gas: v(oth.weight_of_gas), volume_of_gas: v(oth.volume_of_gas), rated_gas_pressure: v(oth.rated_gas_pressure), rated_gas_temperature: v(oth.rated_gas_temperature), op_type: op.type||'', op_serial_no: op.serial_no||'', op_manufacturer: op.manufacturer||'', op_manufacturer_year: op.manufacturer_year||'', op_manufacturer_type: op.manufacturer_type||'', number_of_trip_coil: String(op.number_of_trip_coil||''), number_of_close_coil: String(op.number_of_close_coil||''), op_comment: op.comment||'',
          op_pressure:      v(op.rated_operating_pressure),
          op_pressure_temp: v(op.rated_operating_pressure_temperature),
          motor_rated_voltage: v(op.motor?.rated_voltage), motor_rated_current: v(op.motor?.rated_current), motor_power: op.motor?.power||'', motor_frequency: v(op.motor?.frequency),
          aux_rated_voltage:   v(op.auxiliary_circuits?.rated_voltage), aux_rated_current: v(op.auxiliary_circuits?.rated_current), aux_power: op.auxiliary_circuits?.power||'', aux_frequency: v(op.auxiliary_circuits?.frequency),
          assess_limits: String(dto.assessmentLimits?.limits||''),
          cr_abs_r_min: v(dto.assessmentLimits?.contact_resistance.abs?.r_min), cr_abs_r_max: v(dto.assessmentLimits?.contact_resistance.abs?.r_max),
          cr_rel_r_ref: v(dto.assessmentLimits?.contact_resistance.rel?.r_ref), cr_rel_r_dev: v(dto.assessmentLimits?.contact_resistance.rel?.r_dev),
          ot_opening_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.opening_time?.t_min), ot_opening_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.opening_time?.t_max),
          ot_opening_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.opening_time?.t_ref), ot_opening_rel_p_t_dev: v(dto.assessmentLimits?.operating_time.rel.opening_time?.plus_t_dev), ot_opening_rel_m_t_dev: v(dto.assessmentLimits?.operating_time.rel.opening_time?.minus_t_dev),
          ot_oswp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.opening_sync_within_phase?.t_min), ot_oswp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.opening_sync_within_phase?.t_max), ot_oswp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.opening_sync_within_phase?.t_ref),
          ot_osbp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.opening_sync_breaker_phase?.t_min), ot_osbp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.opening_sync_breaker_phase?.t_max), ot_osbp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.opening_sync_breaker_phase?.t_ref),
          ot_closing_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.closing_time?.t_min), ot_closing_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.closing_time?.t_max),
          ot_closing_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.closing_time?.t_ref), ot_closing_rel_p_t_dev: v(dto.assessmentLimits?.operating_time.rel.closing_time?.plus_t_dev), ot_closing_rel_m_t_dev: v(dto.assessmentLimits?.operating_time.rel.closing_time?.minus_t_dev),
          ot_cswp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.closing_sync_within_phase?.t_min), ot_cswp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.closing_sync_within_phase?.t_max), ot_cswp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.closing_sync_within_phase?.t_ref),
          ot_csbp_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.closing_sync_breaker_phase?.t_min), ot_csbp_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.closing_sync_breaker_phase?.t_max), ot_csbp_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.closing_sync_breaker_phase?.t_ref),
          ot_reclosing_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.reclosing_time?.t_min), ot_reclosing_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.reclosing_time?.t_max), ot_reclosing_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.reclosing_time?.t_ref),
          ot_co_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.close_open_time?.t_min), ot_co_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.close_open_time?.t_max), ot_co_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.close_open_time?.t_ref),
          ot_oc_abs_t_min: v(dto.assessmentLimits?.operating_time.abs.open_close_time?.t_min), ot_oc_abs_t_max: v(dto.assessmentLimits?.operating_time.abs.open_close_time?.t_max), ot_oc_rel_t_ref: v(dto.assessmentLimits?.operating_time.rel.open_close_time?.t_ref),
          ct_total_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.total_travel?.d_min), ct_total_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.total_travel?.d_max), ct_total_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.total_travel?.d_ref), ct_total_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.total_travel?.d_dev),
          ct_ot_trip_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.over_travel_trip?.d_min), ct_ot_trip_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.over_travel_trip?.d_max), ct_ot_trip_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.over_travel_trip?.d_ref), ct_ot_trip_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.over_travel_trip?.d_dev),
          ct_ot_close_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.over_travel_close?.d_min), ct_ot_close_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.over_travel_close?.d_max), ct_ot_close_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.over_travel_close?.d_ref), ct_ot_close_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.over_travel_close?.d_dev),
          ct_rb_trip_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.rebound_trip?.d_min), ct_rb_trip_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.rebound_trip?.d_max), ct_rb_trip_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.rebound_trip?.d_ref), ct_rb_trip_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.rebound_trip?.d_dev),
          ct_rb_close_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.rebound_close?.d_min), ct_rb_close_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.rebound_close?.d_max), ct_rb_close_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.rebound_close?.d_ref), ct_rb_close_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.rebound_close?.d_dev),
          ct_cw_trip_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_trip?.d_min), ct_cw_trip_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_trip?.d_max), ct_cw_trip_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_trip?.d_ref), ct_cw_trip_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_trip?.d_dev),
          ct_cw_close_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_close?.d_min), ct_cw_close_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.contact_wipe_close?.d_max), ct_cw_close_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_close?.d_ref), ct_cw_close_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.contact_wipe_close?.d_dev),
          ct_dd_abs_d_min: v(dto.assessmentLimits?.contact_travel.abs.damping_distance?.d_min), ct_dd_abs_d_max: v(dto.assessmentLimits?.contact_travel.abs.damping_distance?.d_max), ct_dd_rel_d_ref: v(dto.assessmentLimits?.contact_travel.rel.damping_distance?.d_ref), ct_dd_rel_d_dev: v(dto.assessmentLimits?.contact_travel.rel.damping_distance?.d_dev),
          ac_trip_stta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_a?.t_min), ac_trip_stta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_a?.t_max), ac_trip_stta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_a?.t_ref), ac_trip_stta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_a?.t_dev),
          ac_trip_dmta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_a?.t_min), ac_trip_dmta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_a?.t_max), ac_trip_dmta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_a?.t_ref), ac_trip_dmta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_a?.t_dev),
          ac_trip_sttb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_b?.t_min), ac_trip_sttb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_type_b?.t_max), ac_trip_sttb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_b?.t_ref), ac_trip_sttb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_type_b?.t_dev),
          ac_trip_dmtb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_b?.t_min), ac_trip_dmtb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.diff_to_main_type_b?.t_max), ac_trip_dmtb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_b?.t_ref), ac_trip_dmtb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.diff_to_main_type_b?.t_dev),
          ac_trip_stw_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_wiper?.t_min), ac_trip_stw_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.switching_time_wiper?.t_max), ac_trip_stw_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_wiper?.t_ref), ac_trip_stw_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.switching_time_wiper?.t_dev),
          ac_trip_dur_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.duration?.t_min), ac_trip_dur_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.abs.duration?.t_max), ac_trip_dur_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.duration?.t_ref), ac_trip_dur_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.trip_operation.rel.duration?.t_dev),
          ac_close_stta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_a?.t_min), ac_close_stta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_a?.t_max), ac_close_stta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_a?.t_ref), ac_close_stta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_a?.t_dev),
          ac_close_dmta_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_a?.t_min), ac_close_dmta_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_a?.t_max), ac_close_dmta_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_a?.t_ref), ac_close_dmta_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_a?.t_dev),
          ac_close_sttb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_b?.t_min), ac_close_sttb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_type_b?.t_max), ac_close_sttb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_b?.t_ref), ac_close_sttb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_type_b?.t_dev),
          ac_close_dmtb_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_b?.t_min), ac_close_dmtb_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.diff_to_main_type_b?.t_max), ac_close_dmtb_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_b?.t_ref), ac_close_dmtb_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.diff_to_main_type_b?.t_dev),
          ac_close_stw_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_wiper?.t_min), ac_close_stw_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.switching_time_wiper?.t_max), ac_close_stw_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_wiper?.t_ref), ac_close_stw_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.switching_time_wiper?.t_dev),
          ac_close_dur_abs_t_min: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.duration?.t_min), ac_close_dur_abs_t_max: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.abs.duration?.t_max), ac_close_dur_rel_t_ref: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.duration?.t_ref), ac_close_dur_rel_t_dev: v(dto.assessmentLimits?.auxiliary_contacts.close_operation.rel.duration?.t_dev),
          misc_bt_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.bounce_time?.min), misc_bt_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.bounce_time?.max), misc_bt_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.bounce_time?.ref), misc_bt_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.bounce_time?.dev),
          misc_bc_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.bounce_count?.min), misc_bc_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.bounce_count?.max), misc_bc_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.bounce_count?.ref), misc_bc_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.bounce_count?.dev),
          misc_pct_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.pir_close_time?.min), misc_pct_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.pir_close_time?.max), misc_pct_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.pir_close_time?.ref), misc_pct_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.pir_close_time?.dev),
          misc_rt_abs_min: v(dto.assessmentLimits?.miscellaneous.abs.reaction_time?.min), misc_rt_abs_max: v(dto.assessmentLimits?.miscellaneous.abs.reaction_time?.max), misc_rt_rel_ref: v(dto.assessmentLimits?.miscellaneous.rel.reaction_time?.ref), misc_rt_rel_dev: v(dto.assessmentLimits?.miscellaneous.rel.reaction_time?.dev),
          cc_peak_close_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.peak_close_coil_current?.min), cc_peak_close_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.peak_close_coil_current?.max), cc_peak_close_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.peak_close_coil_current?.ref), cc_peak_close_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_close_coil_current?.minus_dev), cc_peak_close_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_close_coil_current?.plus_dev),
          cc_peak_trip_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.peak_trip_coil_current?.min), cc_peak_trip_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.peak_trip_coil_current?.max), cc_peak_trip_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.peak_trip_coil_current?.ref), cc_peak_trip_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_trip_coil_current?.minus_dev), cc_peak_trip_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.peak_trip_coil_current?.plus_dev),
          cc_avg_close_i_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_current?.min), cc_avg_close_i_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_current?.max), cc_avg_close_i_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_close_coil_current?.ref),
          cc_avg_trip_i_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_current?.min), cc_avg_trip_i_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_current?.max), cc_avg_trip_i_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_trip_coil_current?.ref),
          cc_avg_close_u_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_voltage?.min), cc_avg_close_u_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_close_coil_voltage?.max), cc_avg_close_u_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_close_coil_voltage?.ref),
          cc_avg_trip_u_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_voltage?.min), cc_avg_trip_u_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.average_trip_coil_voltage?.max), cc_avg_trip_u_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.average_trip_coil_voltage?.ref),
          cc_close_res_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.close_coil_resistance?.min), cc_close_res_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.close_coil_resistance?.max), cc_close_res_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.close_coil_resistance?.ref), cc_close_res_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.close_coil_resistance?.minus_dev), cc_close_res_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.close_coil_resistance?.plus_dev),
          cc_trip_res_abs_min: v(dto.assessmentLimits?.coil_characteristics.abs.trip_coil_resistance?.min), cc_trip_res_abs_max: v(dto.assessmentLimits?.coil_characteristics.abs.trip_coil_resistance?.max), cc_trip_res_rel_ref: v(dto.assessmentLimits?.coil_characteristics.rel.trip_coil_resistance?.ref), cc_trip_res_rel_m_dev: v(dto.assessmentLimits?.coil_characteristics.rel.trip_coil_resistance?.minus_dev), cc_trip_res_rel_p_dev: v(dto.assessmentLimits?.coil_characteristics.rel.trip_coil_resistance?.plus_dev),
          pv_close_abs_v_min: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_close?.v_min), pv_close_abs_v_max: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_close?.v_max), pv_close_rel_v_ref: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_close?.v_ref), pv_close_rel_v_dev: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_close?.v_dev),
          pv_trip_abs_v_min: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_trip?.v_min), pv_trip_abs_v_max: v(dto.assessmentLimits?.pickup_voltage.abs.min_pickup_voltage_trip?.v_max), pv_trip_rel_v_ref: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_trip?.v_ref), pv_trip_rel_v_dev: v(dto.assessmentLimits?.pickup_voltage.rel.min_pickup_voltage_trip?.v_dev),
          mc_inrush_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.inrush_current?.min), mc_inrush_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.inrush_current?.max), mc_inrush_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.inrush_current?.ref), mc_inrush_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.inrush_current?.dev),
          mc_chg_t_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.charging_time?.min), mc_chg_t_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.charging_time?.max), mc_chg_t_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.charging_time?.ref), mc_chg_t_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.charging_time?.dev),
          mc_chg_i_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.charging_current?.min), mc_chg_i_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.charging_current?.max), mc_chg_i_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.charging_current?.ref), mc_chg_i_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.charging_current?.dev),
          mc_min_u_abs_min: v(dto.assessmentLimits?.motor_characteristics.abs.minimum_voltage?.min), mc_min_u_abs_max: v(dto.assessmentLimits?.motor_characteristics.abs.minimum_voltage?.max), mc_min_u_rel_ref: v(dto.assessmentLimits?.motor_characteristics.rel.minimum_voltage?.ref), mc_min_u_rel_dev: v(dto.assessmentLimits?.motor_characteristics.rel.minimum_voltage?.dev),
          uvr_abs_v_min: v(dto.assessmentLimits?.under_voltage_release.abs.uv_coil_trip_voltage?.min), uvr_abs_v_max: v(dto.assessmentLimits?.under_voltage_release.abs.uv_coil_trip_voltage?.max),
          uvr_rel_v_ref: v(dto.assessmentLimits?.under_voltage_release.rel.uv_coil_trip_voltage?.ref), uvr_rel_v_dev: v(dto.assessmentLimits?.under_voltage_release.rel.uv_coil_trip_voltage?.dev),
          ocr_abs_min: v(dto.assessmentLimits?.overcurrent_release.abs.oc_replay_trip_current?.min), ocr_abs_max: v(dto.assessmentLimits?.overcurrent_release.abs.oc_replay_trip_current?.max),
          ocr_rel_ref: v(dto.assessmentLimits?.overcurrent_release.rel.oc_replay_trip_current?.ref), ocr_rel_dev: v(dto.assessmentLimits?.overcurrent_release.rel.oc_replay_trip_current?.dev),
          tc_rated_voltage: (op.trip_coil_component||[]).map(x => v(x.rated_voltage)),
          tc_rated_current: (op.trip_coil_component||[]).map(x => v(x.rated_current)),
          tc_power:         (op.trip_coil_component||[]).map(x => x.power||''),
          tc_frequency:     (op.trip_coil_component||[]).map(x => v(x.frequency)),
          cc_rated_voltage: (op.close_coil_component||[]).map(x => v(x.rated_voltage)),
          cc_rated_current: (op.close_coil_component||[]).map(x => v(x.rated_current)),
          cc_power:         (op.close_coil_component||[]).map(x => x.power||''),
          cc_frequency:     (op.close_coil_component||[]).map(x => v(x.frequency)),
        }
      }
      else if (cat.key === 'Asset_PowerCableDTO') {
        const rs = await window.electronAPI.getPowerCableEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = powerCableEntityToDto(rs.data); const cfg = dto.configsData||{}, rat = dto.ratingsData||{}, oth = dto.othersData||{}, dat = dto.datasData||{}
        flatMap = { ...this.mapProps(dto.properties), phases: v(cfg.phases), cores: v(cfg.cores), rated_voltage: v(rat.rated_voltage), max_voltage: v(rat.max_voltage), rated_frequency: v(rat.rated_frequency), shortcircuit: v(rat.shortcircuit), rated_duration: v(rat.rated_duration), insulation_method: v(oth.insulation_method), bonding_type: v(oth.bonding_type), install_location: v(oth.install_location), cable_length: v(oth.cable_length), conductor_size: v(dat.conductor?.conductor_size), conductor_class: v(dat.conductor?.conductor_class), conductor_material: v(dat.conductor?.conductor_material), conductor_type: v(dat.conductor?.conductor_type), conductor_diameter: v(dat.conductor?.conductor_diameter), insulation_type: v(dat.insulation?.insulation_type), ins_thickness: v(dat.insulation?.thickness), ins_diameter: v(dat.insulation?.diameter), insulation_operating: v(dat.insulation?.insulation_operating), sheath_type: v(dat.sheath?.sheath_type), sheath_construction: v(dat.sheath?.construction), sheath_thickness: v(dat.sheath?.thickness), sheath_diameter: v(dat.sheath?.diameter), armour_material: v(dat.armour?.material), armour_thickness: v(dat.armour?.thickness), armour_diameter: v(dat.armour?.diameter) }
      }
      else if (cat.key === 'Asset_SurgeArresterDto') {
        const rs = await window.electronAPI.getSurgeArresterEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = surgeArresterEntityToDto(rs.data)
        flatMap = { ...this.mapProps(dto.properties), unitStack: String(dto.ratings?.unitStack||'') }
        arrayMap = {
          sa_serial:          (dto.ratings?.tableRating||[]).map(x => x.serial||''),
          sa_ratedVoltage:    (dto.ratings?.tableRating||[]).map(x => v(x.ratedVoltage)),
          sa_maximumVoltage:  (dto.ratings?.tableRating||[]).map(x => v(x.maximumVoltage)),
          sa_continousVoltage:(dto.ratings?.tableRating||[]).map(x => v(x.continousVoltage)),
          sa_shortCurrent:    (dto.ratings?.tableRating||[]).map(x => v(x.shortCurrent)),
          sa_ratedCircuit:    (dto.ratings?.tableRating||[]).map(x => v(x.ratedCircuit)),
          sa_polesVoltage:    (dto.ratings?.tableRating||[]).map(x => v(x.polesVoltage)),
          sa_isoVoltage:      (dto.ratings?.tableRating||[]).map(x => v(x.isoVoltage)),
        }
      }
      else if (cat.key === 'Asset_BushingAssetDto') {
        // FIX: đúng channel name là getBushingEntityByMrid, không phải getBushingAssetEntityByMrid
        const rs = await window.electronAPI.getBushingEntityByMrid(nodeId)
        if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = bushingEntityToDto(rs.data)
        const b = dto.bushing || {}
        flatMap = {
          ...this.mapProps(dto.properties),
          rated_frequency:    v(b.rated_frequency),
          insulation_level:   v(b.insulation_level),
          voltage_l_ground:   v(b.voltage_l_ground),
          max_system_voltage: v(b.max_system_voltage),
          rated_current:      v(b.rated_current),
          df_c1:              v(b.df_c1),
          cap_c1:             v(b.cap_c1),
          df_c2:              v(b.df_c2),
          cap_c2:             v(b.cap_c2),
          insulation_type:    b.insulation_type || ''
        }
      }
      else if (cat.key === 'Asset_ReactorDto') {
        const rs = await window.electronAPI.getReactorEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = reactorEntityToDto(rs.data); const rat = dto.reactorRating||{}, oth = dto.reactorOther||{}
        flatMap = { ...this.mapProps(dto.properties), rated_voltage: v(rat.rated_voltage), rated_frequency: v(rat.rated_frequency), rated_current: v(rat.rated_current), rated_power: v(rat.rated_power), inductance: v(rat.inductance), insulation_type: oth.insulation_type||'', weight: v(oth.weight) }
      }
      else if (cat.key === 'Asset_CapacitorsDTO') {
        const rs = await window.electronAPI.getCapacitorEntityByMrid(nodeId)
        if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = capacitorEntityToDto(rs.data)
        const r = dto.ratings||{}, cfg = dto.configsData||{}
        const cap = dto.capacitance||{}, df = dto.dissipationFactor||{}, oth = dto.othersData||{}
        flatMap = {
          ...this.mapProps(dto.properties),
          cap_phase:           String(cfg.phase||''),
          cap_phase_name:      cfg.phase_name||'',
          cap_rated_voltage:   v(r.rated_voltage),
          cap_rated_frequency: v(r.rated_frequency),
          cap_rated_current:   v(r.rated_current),
          cap_rated_power:     v(r.rated_power),
          cap_capacitance:     v(cap.capacitance?.value),
          cap_capacitance_A:   v(cap.capacitance_A?.value),
          cap_capacitance_B:   v(cap.capacitance_B?.value),
          cap_capacitance_C:   v(cap.capacitance_C?.value),
          cap_df:              v(df.dissipation_factor?.value),
          cap_df_A:            v(df.dissipation_factor_A?.value),
          cap_df_B:            v(df.dissipation_factor_B?.value),
          cap_df_C:            v(df.dissipation_factor_C?.value),
          cap_insulation_type: oth.insulation_type||'',
          cap_weight:          v(oth.weight)
        }
      }
      else if (cat.key === 'Asset_DisconnectorDTO') {
        const rs = await window.electronAPI.getDisconnectorEntityByMrid(nodeId)
        if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = disconnectorEntityToDto(rs.data)
        const r = dto.ratings || {}
        flatMap = {
          ...this.mapProps(dto.properties),
          dc_rated_voltage:                     v(r.rated_voltage),
          dc_rated_frequency:                   v(r.rated_frequency),
          dc_rated_current:                     v(r.rated_current),
          dc_short_time_withstand_current:      v(r.short_time_withstand_current),
          dc_rated_duration_of_short_circuit:   v(r.rated_duration_of_short_circuit),
          dc_pf_earth_poles:                    v(r.power_freq_withstand_voltage_earth_poles),
          dc_pf_isolating_distance:             v(r.power_freq_withstand_voltage_isolating_distance)
        }
      }
      else if (cat.key === 'Asset_RotatingMachineDTO') {
        const rs = await window.electronAPI.getRotatingMachineEntityByMrid(nodeId); if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = rotatingEntityToDto(rs.data); const rat = dto.ratingsData||{}
        flatMap = { ...this.mapProps(dto.properties), star_point: dto.configsData?.star_point||'', rated_u: v(rat.rated_u), rated_current: v(rat.rated_current), rated_speed: String(rat.rated_speed||''), rated_frequency: v(rat.rated_frequency), rated_power: v(rat.rated_power), rated_power_factor: String(rat.rated_power_factor||''), rated_thermal_class: String(rat.rated_thermal_class||''), rated_ifd: v(rat.rated_ifd), rated_ufd: v(rat.rated_ufd) }
      }
      else if (cat.key.startsWith('Job_')) {
        const jobKey = cat.key.startsWith('Job_Job_') ? cat.key.slice(4) : cat.key
        const jobMap = {
          'Job_TransformerJobDto':        { api: () => window.electronAPI.getTransformerJobByMrid(nodeId),        map: transformerJobEntityToDto },
          'Job_VoltageTransformerJobDto': { api: () => window.electronAPI.getVoltageTransformerJobByMrid(nodeId), map: vtJobEntityToDto },
          'Job_CurrentTransformerJobDto': { api: () => window.electronAPI.getCurrentTransformerJobByMrid(nodeId), map: ctJobEntityToDto },
          'Job_CircuitBreakerJobDto':     { api: () => window.electronAPI.getCircuitBreakerJobByMrid(nodeId),     map: breakerJobEntityToDto },
          'Job_PowerCableJobDto':         { api: () => window.electronAPI.getPowerCableJobByMrid(nodeId),         map: cableJobEntityToDto },
          'Job_SurgeArresterJobDto':      { api: () => window.electronAPI.getSurgeArresterJobByMrid(nodeId),      map: saJobEntityToDto },
          'Job_ReactorJobDto':            { api: () => window.electronAPI.getReactorJobByMrid(nodeId),            map: reactorJobEntityToDto },
          'Job_CapacitorJobDto':          { api: () => window.electronAPI.getCapacitorJobByMrid(nodeId),          map: capacitorJobEntityToDto },
          'Job_DisconnectorJobDto':       { api: () => window.electronAPI.getDisconnectorJobByMrid(nodeId),       map: disconnectorJobEntityToDto },
          'Job_RotatingMachineJobDto':    { api: () => window.electronAPI.getRotatingMachineJobByMrid(nodeId),    map: rotatingJobEntityToDto },
          'Job_BushingJobDto':            { api: () => window.electronAPI.getBushingJobByMrid(nodeId),            map: bushingJobEntityToDto },
        }
        const entry = jobMap[jobKey]
        if (!entry) return EMPTY_RESULT
        const rs = await entry.api()
        if (!rs?.success || !rs.data) return EMPTY_RESULT
        const dto = entry.map(rs.data)
        const p = dto.properties || {}
        flatMap = {
          job_name:      p.name           || '',
          job_type:      p.type || p.job_type || '',
          creation_date: p.creation_date  || p.created_date_time || '',
          execution_date:p.execution_date || '',
          tested_by:     p.tested_by      || '',
          approved_by:   p.approved_by    || p.approver || '',
          approval_date: p.approval_date  || '',
          test_method:   p.test_method    || '',
          ref_standard:  p.ref_standard   || '',
          summary:       p.summary || p.description || ''
        }
        // TestingEquipment — lấy item đầu tiên nếu có (multi-equipment dùng arrayMap)
        arrayMap = this.buildTestArrayMap(dto.testList)
        if (dto.testingEquipmentData && dto.testingEquipmentData.length > 0) {
          arrayMap['te_model']            = dto.testingEquipmentData.map(x => x.model            || '')
          arrayMap['te_serial_number']    = dto.testingEquipmentData.map(x => x.serial_number    || '')
          arrayMap['te_calibration_date'] = dto.testingEquipmentData.map(x => x.calibration_date || '')
        }
      }
      return { flatMap, arrayMap }
    } catch(e) { console.error('buildDtoForCat error:', cat.key, e); return EMPTY_RESULT }
  },

  extractFromMaps(cat, flatMap, arrayMap, tableData) {
    const result = {}
    // FIX: guard undefined flatMap/arrayMap (khi buildDtoForCat trả EMPTY_RESULT)
    if (!flatMap) flatMap = {}
    for (const row of tableData) {
      if (!row.code || row.category !== cat.category) continue
      if (cat.assetType && (row.featureLevels && row.featureLevels[0] ? row.featureLevels[0].key : null) !== cat.assetType) continue
      const leafValue = this.getLeafValue(row.featureLevels, row.category)
      if (!leafValue) continue

      if (arrayMap && leafValue in arrayMap) {
        result[row.code] = arrayMap[leafValue].map(v => (v !== undefined && v !== null) ? String(v) : '')
      } else if (flatMap && leafValue in flatMap) {
        const val = flatMap[leafValue]
        result[row.code] = [(val !== undefined && val !== null) ? String(val) : '']
      }
    }
    return result
  },

  getLeafValue(featureLevels, category) {
    if (!featureLevels?.length) return null
    let node = FEATURE_TREE[category]; if (!node) return null
    for (const level of featureLevels) { if (!level.key) break; node = node.children?.[level.key]; if (!node) return null }
    return node?.value ?? null
  }
}
