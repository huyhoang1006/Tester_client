/* eslint-disable */
/**
 * importService.js — Ngược của exportService
 *
 * Export: DB entity → buildDtoForCat → flatMap/arrayMap → extractFromMaps → {code:[vals]} → fill Excel
 * Import: read Excel → {code:[vals]} → reverseExtract → {leafVal:vals} → update DB entity
 *
 * "leafValue" = giá trị .value ở lá của FEATURE_TREE, ví dụ 'serial_no', 'name', 'VTRatio_name'
 * Đây cũng chính là key trong flatMap/arrayMap của exportService, nên reverse 1-1.
 */
import { FEATURE_TREE } from '../../Common/constants'
import uuid from '@/utils/uuid'
import * as TransformerMapper from '@/views/Mapping/Transformer'
import * as VoltageTransformerMapper from '@/views/Mapping/VoltageTransformer'
import * as CurrentTransformerMapper from '@/views/Mapping/CurrentTransformer'
import * as PowerCableMapper from '@/views/Mapping/PowerCable'
import * as SurgeArresterMapper from '@/views/Mapping/SurgeArrester'
import * as ReactorMapper from '@/views/Mapping/Reactor'
import * as CapacitorMapper from '@/views/Mapping/Capacitor'
import * as DisconnectorMapper from '@/views/Mapping/Disconnector'
import * as RotatingMachineMapper from '@/views/Mapping/RotatingMachine'
import * as BushingMapper from '@/views/Mapping/Bushing'
import { OrgDtoToOrgEntity, OrgEntityToOrgDto } from '@/views/Mapping/Organisation'
import * as SubstationMapper from '@/views/Mapping/Substation'
import { volDtoToVolEntity, volEntityToVolDto } from '@/views/Mapping/VoltageLevel'

export const importService = {

  // ── SHARED: getLeafValue — copy từ exportService ──────────────────────────
  getLeafValue(featureLevels, category) {
    if (!featureLevels || !featureLevels.length) return null
    let node = FEATURE_TREE[category]
    if (!node) return null
    for (const level of featureLevels) {
      if (!level.key) break
      node = node.children && node.children[level.key]
      if (!node) return null
    }
    return (node && node.value !== undefined) ? node.value : null
  },

  // ── STEP 1: Ngược của extractFromMaps ────────────────────────────────────
  // extractFromMaps: {flatMap, arrayMap} → {code: [vals]}
  // reverseExtract:  {code: [vals]}      → {leafValue: val|[vals]}
  reverseExtract(codeValueMap, tableData, cat) {
    const leafValueMap = {}
    for (const row of tableData) {
      if (!row.code || row.category !== cat.category) continue
      const assetType = row.featureLevels && row.featureLevels[0] ? row.featureLevels[0].key : null
      if (cat.assetType && assetType !== cat.assetType) continue

      const leafValue = this.getLeafValue(row.featureLevels, row.category)
      if (!leafValue) continue

      const values = codeValueMap[row.code] || []
      if (!values.length) continue

      // Giữ nguyên dạng array (occurrence-indexed) để entity update dùng
      leafValueMap[leafValue] = values.length === 1 ? values[0] : values
    }
    return leafValueMap
  },

  // ── STEP 2: apply leafValueMap lên entity và gọi update API ──────────────
  // lvm = { leafValue: scalarString | [v0, v1, ...] }
  // Với scalar: lvm['name'] = 'EVN'
  // Với array:  lvm['rated_burden'] = ['100', '50']  (occurrence-based)

  _str(v) { return (v !== undefined && v !== null) ? String(v) : '' },
  _num(v) { const n = parseFloat(v); return isNaN(n) ? v : n },
  _apply(obj, key, val) { if (val !== undefined) obj[key] = val },
  _applyDtoValue(obj, key, val) {
    if (val === undefined || val === null || !obj) return
    const value = Array.isArray(val) ? val[0] : val
    if (obj[key] && typeof obj[key] === 'object' && Object.prototype.hasOwnProperty.call(obj[key], 'value')) {
      obj[key].value = value
      if (!obj[key].mrid && String(value).trim()) obj[key].mrid = uuid.newUuid()
    } else obj[key] = value
  },
  _mapAssetEntity(oldEntity, dto, toEntity, lvm) {
    const entity = toEntity(dto)
    if (entity.productAssetModel) {
      entity.productAssetModel.model_number = lvm.model !== undefined
        ? (Array.isArray(lvm.model) ? lvm.model[0] : lvm.model)
        : oldEntity.productAssetModel?.model_number
    }
    return entity
  },

  // ── Org ──────────────────────────────────────────────────────────────────
  async updateOrg(mrid, lvm) {
    const rs = await window.electronAPI.getOrganisationEntityByMrid(mrid)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch org' }
    const e = OrgEntityToOrgDto(rs.data)
    const fields = ['name','aliasName','tax_code','street','ward_or_commune','district_or_town',
                    'city','state_or_province','postal_code','country','phoneNumber','fax','email','comment']
    fields.forEach(f => { if (lvm[f] !== undefined) this._apply(e, f, lvm[f]) })
    return window.electronAPI.insertParentOrganizationEntity(OrgDtoToOrgEntity(e))
  },

  // ── Substation ───────────────────────────────────────────────────────────
  async updateSubstation(mrid, lvm) {
    const rs = await window.electronAPI.getSubstationEntityByMrid(mrid)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch substation' }
    const e = SubstationMapper.mapEntityToDto(rs.data)
    const fields = ['name','aliasName','type','generation','industry','locationName','street',
                    'ward_or_commune','district_or_town','state_or_province','city','country',
                    'personName','department','position','phoneNumber','fax','email','comment']
    fields.forEach(f => { if (lvm[f] !== undefined) this._apply(e, f, lvm[f]) })
    return window.electronAPI.insertSubstationEntity(SubstationMapper.mapDtoToEntity(e))
  },

  // ── VoltageLevel ─────────────────────────────────────────────────────────
  async updateVoltageLevel(mrid, lvm) {
    const rs = await window.electronAPI.getVoltageLevelEntityByMrid(mrid)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch voltageLevel' }
    const e = volEntityToVolDto(rs.data)
    const fields = ['name','comment','high_voltage_limit_value','low_voltage_limit_value','base_voltage_value']
    fields.forEach(f => { if (lvm[f] !== undefined) this._apply(e, f, lvm[f]) })
    return window.electronAPI.insertVoltageLevelEntity(volDtoToVolEntity(e))
  },

  // ── Bay ──────────────────────────────────────────────────────────────────
  async updateBay(mrid, lvm) {
    const rs = await window.electronAPI.getBayEntityByMrid(mrid)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch bay' }
    const e = rs.data
    const fields = ['name','aliasName','breaker_configuration','bus_bar_configuration']
    fields.forEach(f => { if (lvm[f] !== undefined) this._apply(e, f, lvm[f]) })
    return window.electronAPI.insertBayEntity(e)
  },

  // ── Helper: apply properties (serial_no, manufacturer, ...) ──────────────
  // Export dùng mapProps() đặt các field này trực tiếp trong flatMap
  // → Import ghi thẳng vào entity.properties (hoặc entity nếu flat)
  _applyProps(entity, lvm) {
    const propKeys = ['type','kind','serial_no','manufacturer','manufacturer_type',
                      'manufacturer_year','model','country_of_origin','apparatus_id',
                      'comment']
    const target = entity.properties || entity
    propKeys.forEach(k => {
      if (lvm[k] !== undefined) target[k] = Array.isArray(lvm[k]) ? lvm[k][0] : lvm[k]
    })
    if (lvm.type !== undefined && Object.prototype.hasOwnProperty.call(target, 'asset_type')) target.asset_type = target.type
    if (lvm.manufacturer_year !== undefined && Object.prototype.hasOwnProperty.call(target, 'manufacturing_year')) {
      target.manufacturing_year = target.manufacturer_year
    }
  },

  // ── Helper: apply array-field occurrence-indexed ─────────────────────────
  // Ví dụ arrayMap['rated_burden'] = ['100','50'] (2 windings của VT)
  // lvm['rated_burden'] = ['100','50']
  // → entity.vt_Configuration.dataVT[0].rated_burden = '100'
  //   entity.vt_Configuration.dataVT[1].rated_burden = '50'
  _applyArrayField(arr, index, field, lvm) {
    if (lvm[field] === undefined) return
    const values = Array.isArray(lvm[field]) ? lvm[field] : [lvm[field]]
    values.forEach((value, i) => {
      if (!arr[index + i]) arr[index + i] = { mrid: uuid.newUuid(), name: `${index + i + 1}a${index + i + 1}n` }
      const row = arr[index + i].table || arr[index + i]
      if ((field === 'usr_rated_voltage' || field === 'rated_burden') && !row[field]) {
        row[field] = { mrid: uuid.newUuid(), value: '', unit: field === 'usr_rated_voltage' ? 'V' : 'VA' }
      }
      this._applyDtoValue(row, field, value)
    })
  },

  // ── Voltage Transformer ──────────────────────────────────────────────────
  async updateVT(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getVoltageTransformerEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch VT' }
    const e = VoltageTransformerMapper.voltageTransformerEntityToDto(rs.data)
    this._applyProps(e, lvm)
    // ratings (scalar)
    if (!e.ratings) e.ratings = {}
    const ratScalar = ['standard','rated_frequency','upr','rated_voltage','c1','c2']
    ratScalar.forEach(f => this._applyDtoValue(e.ratings, f, lvm[f]))
    // config
    if (!e.vt_Configuration) e.vt_Configuration = {}
    if (lvm['windings'] !== undefined) e.vt_Configuration.windings = lvm['windings']
    // dataVT array: usr_formula, usr_rated_voltage, rated_burden, rated_power_factor
    const vtArrFields = ['usr_formula','usr_rated_voltage','rated_burden','rated_power_factor']
    if (vtArrFields.some(f => lvm[f] !== undefined)) {
      if (!e.vt_Configuration.dataVT) e.vt_Configuration.dataVT = []
      const maxLen = Math.max(...vtArrFields.map(f => Array.isArray(lvm[f]) ? lvm[f].length : (lvm[f] !== undefined ? 1 : 0)))
      for (let i = 0; i < maxLen; i++) { if (!e.vt_Configuration.dataVT[i]) e.vt_Configuration.dataVT[i] = {} }
      vtArrFields.forEach(f => this._applyArrayField(e.vt_Configuration.dataVT, 0, f, lvm))
    }
    return window.electronAPI.insertVoltageTransformerEntity(rs.data, this._mapAssetEntity(rs.data, e, VoltageTransformerMapper.voltageTransformerDtoToEntity, lvm))
  },

  // ── Current Transformer ──────────────────────────────────────────────────
  async updateCT(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getCurrentTransformerEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch CT' }
    const e = CurrentTransformerMapper.currentTransformerEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.ratings) e.ratings = {}
    const ratScalar = ['standard','rated_frequency','primary_winding_count','um_rms',
                       'u_withstand_rms','u_lightning_peak','icth','idyn_peak','ith_rms',
                       'ith_duration','system_voltage','bil','rating_factor']
    ratScalar.forEach(f => this._applyDtoValue(e.ratings, f, lvm[f]))
    if (!e.ctConfiguration) e.ctConfiguration = {}
    if (lvm['ct_cores'] !== undefined) e.ctConfiguration.cores = lvm['ct_cores']
    return window.electronAPI.insertCurrentTransformerEntity(rs.data, this._mapAssetEntity(rs.data, e, CurrentTransformerMapper.currentTransformerDtoToEntity, lvm))
  },

  // ── Transformer ───────────────────────────────────────────────────────────
  async updateTransformer(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getTransformerEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Transformer' }
    const e = TransformerMapper.transformerEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.winding_configuration) e.winding_configuration = {}
    const wcFields = ['phases','vector_group_custom','unsupported_vector_group']
    wcFields.forEach(f => { if (lvm[f] !== undefined) e.winding_configuration[f] = lvm[f] })
    if (!e.ratings) e.ratings = {}
    const rScalar = ['rated_frequency']
    rScalar.forEach(f => this._applyDtoValue(e.ratings, f, lvm[f]))
    if (!e.others) e.others = {}
    const othFields = ['category','status','tank_type','insulation_medium']
    othFields.forEach(f => { if (lvm[f] !== undefined) e.others[f] = lvm[f] })
    if (!e.tap_changers) e.tap_changers = {}
    const tcFields = ['tap_mode','tap_serial_no','tap_manufacturer','tap_manufacturer_type','tap_winding','tap_scheme','no_of_taps']
    const tcMap = { tap_mode:'mode', tap_serial_no:'serial_no', tap_manufacturer:'manufacturer',
                    tap_manufacturer_type:'manufacturer_type', tap_winding:'winding', tap_scheme:'tap_scheme', no_of_taps:'no_of_taps' }
    tcFields.forEach(f => { if (lvm[f] !== undefined) e.tap_changers[tcMap[f]] = lvm[f] })
    return window.electronAPI.insertTransformerEntity(rs.data, this._mapAssetEntity(rs.data, e, TransformerMapper.transformerDtoToEntity, lvm))
  },

  // ── Circuit Breaker ──────────────────────────────────────────────────────
  async updateBreaker(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getBreakerEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Breaker' }
    const oldEntity = rs.data
    const entity = JSON.parse(JSON.stringify(oldEntity))
    const fields = {
      kind: [entity.asset, 'kind'],
      type: [entity.asset, 'type'],
      serial_no: [entity.asset, 'serial_number'],
      manufacturer: [entity.productAssetModel, 'manufacturer'],
      manufacturer_type: [entity.oldBreakerInfo, 'manufacturer_type'],
      manufacturer_year: [entity.lifecycleDate, 'manufactured_date'],
      model: [entity.productAssetModel, 'model_number'],
      country_of_origin: [entity.asset, 'country_of_origin'],
      apparatus_id: [entity.asset, 'name'],
      comment: [entity.asset, 'description']
    }
    for (const [key, [target, column]] of Object.entries(fields)) {
      if (lvm[key] === undefined) continue
      if (!target) return { success: false, message: `Cannot update ${key}: related record is missing` }
      target[column] = Array.isArray(lvm[key]) ? lvm[key][0] : lvm[key]
    }

    const ratings = {
      rated_voltage_ll: [entity.oldBreakerInfo, 'rated_voltage', entity.voltage, 'k', 'V'],
      rated_current: [entity.oldBreakerInfo, 'rated_current', entity.currentFlow, null, 'A'],
      rated_frequency: [entity.oldBreakerInfo, 'rated_frequency', entity.frequency, null, 'Hz'],
      rated_short_circuit_breaking_current: [entity.breakerRatingInfo, 'rated_short_circuit_breaking_current', entity.currentFlow, 'k', 'A'],
      short_circuit_nominal_duration: [entity.breakerRatingInfo, 'short_circuit_nominal_duration', entity.second, null, 's'],
      rated_insulation_level: [entity.breakerRatingInfo, 'rated_insulation_level', entity.voltage, 'k', 'V'],
      rated_interrupting_time: [entity.oldBreakerInfo, 'rated_interrupting_time', entity.second, 'm', 's'],
      rated_power_at_closing: [entity.breakerRatingInfo, 'rated_power_closing', entity.activePower, null, 'W'],
      rated_power_at_opening: [entity.breakerRatingInfo, 'rated_power_opening', entity.activePower, null, 'W'],
      rated_power_at_motor_charge: [entity.breakerRatingInfo, 'rated_power_motor_charge', entity.activePower, null, 'W']
    }
    for (const [key, [owner, reference, collection, multiplier, unit]] of Object.entries(ratings)) {
      if (lvm[key] === undefined) continue
      if (!owner || !Array.isArray(collection)) return { success: false, message: `Cannot update ${key}: rating record is missing` }
      const raw = Array.isArray(lvm[key]) ? lvm[key][0] : lvm[key]
      const value = String(raw ?? '').trim()
      if (!value) continue
      const numeric = value.match(/^([+-]?(?:\d+(?:[.,]\d*)?|[.,]\d+))(?:\s*(?:kV|V|kA|A|Hz|ms|s|kW|W))?$/i)
      const number = numeric ? Number(numeric[1].replace(',', '.')) : NaN
      if (!Number.isFinite(number)) return { success: false, message: `${key} must be numeric` }
      let record = collection.find(item => item.mrid === owner[reference])
      if (!record) {
        record = {mrid: uuid.newUuid(), multiplier, unit, value: number}
        collection.push(record)
        owner[reference] = record.mrid
      } else record.value = number
    }
    return window.electronAPI.insertBreakerEntity(oldEntity, entity)
  },

  // ── Power Cable ──────────────────────────────────────────────────────────
  async updateCable(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getPowerCableEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Cable' }
    const e = PowerCableMapper.powerCableEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.configsData) e.configsData = {}
    this._applyDtoValue(e.configsData, 'phases', lvm.phases)
    this._applyDtoValue(e.configsData, 'cores', lvm.cores)
    if (!e.ratingsData) e.ratingsData = {}
    const rFields = ['rated_voltage','max_voltage','rated_frequency','shortcircuit','rated_duration']
    rFields.forEach(f => this._applyDtoValue(e.ratingsData, f, lvm[f]))
    if (!e.othersData) e.othersData = {}
    const oFields = ['insulation_method','bonding_type','install_location','cable_length']
    oFields.forEach(f => this._applyDtoValue(e.othersData, f, lvm[f]))
    return window.electronAPI.insertPowerCableEntity(rs.data, this._mapAssetEntity(rs.data, e, PowerCableMapper.powerCableDtoToEntity, lvm))
  },

  // ── Surge Arrester ───────────────────────────────────────────────────────
  async updateSurgeArrester(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getSurgeArresterEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch SA' }
    const e = SurgeArresterMapper.surgeArresterEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (lvm['unitStack'] !== undefined) { if (!e.ratings) e.ratings = {}; e.ratings.unitStack = lvm['unitStack'] }
    return window.electronAPI.insertSurgeArresterEntity(rs.data, this._mapAssetEntity(rs.data, e, SurgeArresterMapper.surgeArresterDtoToEntity, lvm))
  },

  // ── Reactor ──────────────────────────────────────────────────────────────
  async updateReactor(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getReactorEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Reactor' }
    const e = ReactorMapper.reactorEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.reactorRating) e.reactorRating = {}
    const rFields = ['rated_voltage','rated_frequency','rated_current','rated_power','inductance']
    rFields.forEach(f => this._applyDtoValue(e.reactorRating, f, lvm[f]))
    if (!e.reactorOther) e.reactorOther = {}
    if (lvm['insulation_type'] !== undefined) e.reactorOther.insulation_type = lvm['insulation_type']
    this._applyDtoValue(e.reactorOther, 'weight', lvm.weight)
    return window.electronAPI.insertReactorEntity(rs.data, this._mapAssetEntity(rs.data, e, ReactorMapper.reactorDtoToEntity, lvm))
  },

  // ── Capacitor ────────────────────────────────────────────────────────────
  async updateCapacitor(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getCapacitorEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Capacitor' }
    const e = CapacitorMapper.capacitorEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.configsData) e.configsData = {}
    if (lvm['cap_phase'] !== undefined) e.configsData.phase = lvm['cap_phase']
    if (lvm['cap_phase_name'] !== undefined) e.configsData.phase_name = lvm['cap_phase_name']
    if (!e.ratings) e.ratings = {}
    const rFields = { cap_rated_voltage:'rated_voltage', cap_rated_frequency:'rated_frequency',
                      cap_rated_current:'rated_current', cap_rated_power:'rated_power' }
    Object.entries(rFields).forEach(([lv, ef]) => this._applyDtoValue(e.ratings, ef, lvm[lv]))
    return window.electronAPI.insertCapacitorEntity(rs.data, this._mapAssetEntity(rs.data, e, CapacitorMapper.capacitorDtoToEntity, lvm))
  },

  // ── Disconnector ─────────────────────────────────────────────────────────
  async updateDisconnector(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getDisconnectorEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Disconnector' }
    const e = DisconnectorMapper.disconnectorEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.ratings) e.ratings = {}
    const rMap = {
      dc_rated_voltage:'rated_voltage', dc_rated_frequency:'rated_frequency',
      dc_rated_current:'rated_current', dc_short_time_withstand_current:'short_time_withstand_current',
      dc_rated_duration_of_short_circuit:'rated_duration_of_short_circuit',
      dc_pf_earth_poles:'power_freq_withstand_voltage_earth_poles',
      dc_pf_isolating_distance:'power_freq_withstand_voltage_isolating_distance'
    }
    Object.entries(rMap).forEach(([lv, ef]) => this._applyDtoValue(e.ratings, ef, lvm[lv]))
    return window.electronAPI.insertDisconnectorEntity(this._mapAssetEntity(rs.data, e, DisconnectorMapper.disconnectorDtoToEntity, lvm))
  },

  // ── Rotating Machine ─────────────────────────────────────────────────────
  async updateRotatingMachine(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getRotatingMachineEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch RotatingMachine' }
    const e = RotatingMachineMapper.rotatingEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.ratingsData) e.ratingsData = {}
    const rFields = ['rated_u','rated_current','rated_speed','rated_frequency','rated_power',
                     'rated_power_factor','rated_thermal_class','rated_ifd','rated_ufd']
    rFields.forEach(f => this._applyDtoValue(e.ratingsData, f, lvm[f]))
    if (!e.configsData) e.configsData = {}
    if (lvm['star_point'] !== undefined) e.configsData.star_point = lvm['star_point']
    return window.electronAPI.insertRotatingMachineEntity(this._mapAssetEntity(rs.data, e, RotatingMachineMapper.rotatingDtoToEntity, lvm))
  },

  // ── Bushing ──────────────────────────────────────────────────────────────
  async updateBushing(mrid, lvm, parentId) {
    const rs = await window.electronAPI.getBushingEntityByMrid(mrid, parentId)
    if (!rs || !rs.success || !rs.data) return { success: false, message: 'Cannot fetch Bushing' }
    const e = BushingMapper.bushingEntityToDto(rs.data)
    this._applyProps(e, lvm)
    if (!e.bushing) e.bushing = {}
    const bFields = ['rated_frequency','insulation_level','voltage_l_ground','max_system_voltage',
                     'rated_current','df_c1','cap_c1','df_c2','cap_c2','insulation_type']
    bFields.forEach(f => this._applyDtoValue(e.bushing, f, lvm[f]))
    return window.electronAPI.insertBushingEntity(this._mapAssetEntity(rs.data, e, BushingMapper.bushingDtoToEntity, lvm))
  },

  // ── Dispatch: catKey → đúng hàm update ──────────────────────────────────
  async applyImportForCat(cat, lvm, ctx) {
    const k = cat.key
    const assetMrid = ctx.asset && ctx.asset.mrid ? ctx.asset.mrid : null
    const parentId = ctx.bay?.mrid || ctx.voltageLevel?.mrid || ctx.substation?.mrid || null
    if (k === 'OrgEntityToOrgDto')             return this.updateOrg(ctx.organisation && ctx.organisation.mrid, lvm)
    if (k === 'SubstationDto')                 return this.updateSubstation(ctx.substation && ctx.substation.mrid, lvm)
    if (k === 'VoltageLevelDto')               return this.updateVoltageLevel(ctx.voltageLevel && ctx.voltageLevel.mrid, lvm)
    if (k === 'Bay')                           return this.updateBay(ctx.bay && ctx.bay.mrid, lvm)
    if (k === 'Asset_TransformerDataDto')      return this.updateTransformer(assetMrid, lvm, parentId)
    if (k === 'Asset_VoltageTransformerDto')   return this.updateVT(assetMrid, lvm, parentId)
    if (k === 'Asset_CurrentTransformerDto')   return this.updateCT(assetMrid, lvm, parentId)
    if (k === 'Asset_CircuitBreakerDto')       return this.updateBreaker(assetMrid, lvm, parentId)
    if (k === 'Asset_PowerCableDTO')           return this.updateCable(assetMrid, lvm, parentId)
    if (k === 'Asset_SurgeArresterDto')        return this.updateSurgeArrester(assetMrid, lvm, parentId)
    if (k === 'Asset_ReactorDto')              return this.updateReactor(assetMrid, lvm, parentId)
    if (k === 'Asset_CapacitorsDTO')           return this.updateCapacitor(assetMrid, lvm, parentId)
    if (k === 'Asset_DisconnectorDTO')         return this.updateDisconnector(assetMrid, lvm, parentId)
    if (k === 'Asset_RotatingMachineDTO')      return this.updateRotatingMachine(assetMrid, lvm, parentId)
    if (k === 'Asset_BushingAssetDto')         return this.updateBushing(assetMrid, lvm, parentId)
    // Job: cập nhật test data phức tạp — bỏ qua
    return { skipped: true, reason: 'Job import not yet supported' }
  },

  // ── Main: import toàn bộ template cho 1 node ─────────────────────────────
  // codeValueMap: { code: [vals] }  ← từ ipcmain readExcelForImport
  // tableData, exportCategories: giống export
  // ctx: từ buildContextFromNode
  async importNode(codeValueMap, tableData, exportCategories, ctx) {
    const results = []
    for (const cat of exportCategories) {
      // Reverse extract: {code:[vals]} → {leafValue: val|[vals]}
      const lvm = this.reverseExtract(codeValueMap, tableData, cat)
      if (Object.keys(lvm).length === 0) {
        results.push({ catKey: cat.key, label: cat.label, skipped: true, reason: 'No matching data in Excel' })
        continue
      }
      try {
        const rs = await this.applyImportForCat(cat, lvm, ctx)
        if (rs && rs.skipped) {
          results.push({ catKey: cat.key, label: cat.label, skipped: true, reason: rs.reason })
        } else {
          const ok = rs && (rs.success !== false)
          results.push({ catKey: cat.key, label: cat.label, success: ok, error: ok ? null : (rs && rs.message) })
        }
      } catch(e) {
        results.push({ catKey: cat.key, label: cat.label, success: false, error: e.message })
      }
    }
    return results
  }
}
