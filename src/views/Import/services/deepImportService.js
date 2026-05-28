/* eslint-disable */
/**
 * deepImportService.js
 *
 * Thiết kế: INSERT THEO HIERARCHY, IDEMPOTENT THEO NAME
 *
 * Hierarchy: Organisation → Substation → VoltageLevel → Bay → Asset → Job
 *
 * Tư duy:
 * - Đọc Excel → extract data từng level
 * - Nếu user chọn node Org → bỏ qua Org, insert từ Sub trở xuống
 * - Nếu user chọn node Sub → bỏ qua Org+Sub, insert từ VL trở xuống
 * - Mỗi level có trường tiên quyết (name, serial_no) — nếu thiếu → skip level đó
 * - Trước khi insert: tìm entity cùng name trong parent
 *   - Tìm thấy + overwrite=true  → ghi đè fields, giữ MRID cũ
 *   - Tìm thấy + overwrite=false → dùng làm parent (không thay đổi dữ liệu)
 *   - Không tìm thấy             → insert mới
 */

import {FEATURE_TREE} from '../../Common/constants'
import uuid from '@/utils/uuid'
// DTO classes — same as LocationInsert mixin pattern
// Mappers: mapDtoToEntity (reverse of EntityToDto used in exportService)
import { OrgDtoToOrgEntity }  from '@/views/Mapping/Organisation/index'
import { mapDtoToEntity as subDtoToEntity } from '@/views/Mapping/Substation/index'
import { volDtoToVolEntity }     from '@/views/Mapping/VoltageLevel/index'
// Bay: không có DtoToEntity mapper riêng — gọi API với BayDto trực tiếp
// Job mappers — tất cả đều export jobDtoToEntity
import { jobDtoToEntity as vtJobDtoToEntity }   from '@/views/Mapping/VoltageTransformerJob/index'
import { jobDtoToEntity as ctJobDtoToEntity }   from '@/views/Mapping/CurrentTransformerJob/index'
import { jobDtoToEntity as tfJobDtoToEntity }   from '@/views/Mapping/TransformerJob/index'
import { jobDtoToEntity as brJobDtoToEntity }   from '@/views/Mapping/CircuitBreakerJob/index'
import { jobDtoToEntity as caJobDtoToEntity }   from '@/views/Mapping/PowerCableJob/index'
import { jobDtoToEntity as saJobDtoToEntity }   from '@/views/Mapping/SurgerArresterJob/index'
import { jobDtoToEntity as reJobDtoToEntity }   from '@/views/Mapping/ReactorJob/index'
import { jobDtoToEntity as cpJobDtoToEntity }   from '@/views/Mapping/CapacitorJob/index'
import { jobDtoToEntity as dcJobDtoToEntity }   from '@/views/Mapping/DisconnectorJob/index'
import { jobDtoToEntity as rmJobDtoToEntity }   from '@/views/Mapping/RotatingMachineJob/index'
import { jobDtoToEntity as buJobDtoToEntity }   from '@/views/Mapping/BushingJob/index'
// Asset DTO classes — dùng làm base object (có đủ nested structure)
import organisationDto  from '@/views/Dto/Organisation'
import substationDto    from '@/views/Dto/Substation'
import voltageLevelDto  from '@/views/Dto/VoltageLevel'
import bayDto           from '@/views/Dto/Bay'
import VoltageTransformerDto  from '@/views/Dto/VoltageTransformer'
import CurrentTransformerDto  from '@/views/Dto/CurrentTransformer'
import TransformerDto         from '@/views/Dto/Transformer'
import CircuitBreakerDto      from '@/views/Dto/CircuitBreaker'
import PowerCableDto          from '@/views/Dto/PowerCable'
import SurgeArresterDto       from '@/views/Dto/SurgeAsset'
import ReactorDto             from '@/views/Dto/Reactor'
import CapacitorDto           from '@/views/Dto/Capacitor'
import DisconnectorDto        from '@/views/Dto/Disconnector'
import RotatingMachineDto     from '@/views/Dto/RotatingMachine'
import BushingDto             from '@/views/Dto/BushingAsset'
// Asset mappers — mỗi loại có mapDtoToEntity riêng
import { mapDtoToEntity as vtMapDtoToEntity }          from '@/views/Mapping/VoltageTransformer/index'
import { mapDtoToEntity as ctMapDtoToEntity }          from '@/views/Mapping/CurrentTransformer/index'
import { transformerDtoToEntity as tfMapDtoToEntity }   from '@/views/Mapping/Transformer/index'
import { mapDtoToEntity as breakerMapDtoToEntity }     from '@/views/Mapping/Breaker/index'
import { mapDtoToEntity as cableMapDtoToEntity }       from '@/views/Mapping/PowerCable/index'
import { mapDtoToEntity as saMapDtoToEntity }          from '@/views/Mapping/SurgeArrester/index'
import { mapDtoToEntity as reactorMapDtoToEntity }     from '@/views/Mapping/Reactor/index'
import { mapDtoToEntity as capacitorMapDtoToEntity }   from '@/views/Mapping/Capacitor/index'
import { disconnectorDtoToEntity as disconnectorMapDtoToEntity } from '@/views/Mapping/Disconnector/index'
import { mapDtoToEntity as rotatingMapDtoToEntity }    from '@/views/Mapping/RotatingMachine/index'
import { mapDtoToEntity as bushingMapDtoToEntity }     from '@/views/Mapping/Bushing/index'
// Asset DTO classes

// ROOT org mrid
var ROOT_MRID = '00000000-0000-0000-0000-000000000000'

// Thứ tự level và cấu hình từng level
var LEVEL_ORDER = [
  { id: 'org',   catKey: 'OrgEntityToOrgDto',  label: 'Organisation',   mode: 'organisation',  reqField: 'name',       reqLabel: 'name' },
  { id: 'sub',   catKey: 'SubstationDto',       label: 'Substation',     mode: 'substation',    reqField: 'name',       reqLabel: 'name' },
  { id: 'vl',    catKey: 'VoltageLevelDto',     label: 'Voltage Level',  mode: 'voltageLevel',  reqField: 'name',       reqLabel: 'name' },
  { id: 'bay',   catKey: 'Bay',                 label: 'Bay',            mode: 'bay',           reqField: 'name',       reqLabel: 'name' },
  // Asset & Job: dynamic — thêm khi buildLevelData
]

// leafValue trong FEATURE_TREE là serial_no cho tất cả asset
var ASSET_REQ_FIELD = 'serial_no'
var JOB_REQ_FIELD   = 'job_name'

export var deepImportService = {

  // ── 1. getLeafValue (copy từ exportService) ───────────────────────────
  getLeafValue: function(featureLevels, category) {
    if (!featureLevels || !featureLevels.length) return null
    var node = FEATURE_TREE[category]
    if (!node) return null
    for (var i = 0; i < featureLevels.length; i++) {
      var level = featureLevels[i]
      if (!level.key) break
      node = node.children && node.children[level.key]
      if (!node) return null
    }
    return (node && node.value !== undefined) ? node.value : null
  },

  // ── 2. Xây level data từ codeValueMap ────────────────────────────────
  // Returns: { 'OrgEntityToOrgDto': {name:'EVN',...}, 'SubstationDto': {name:'Trạm',...}, ... }
  buildAllLevelData: function(codeValueMap, tableData) {
    var levels = {}
    for (var i = 0; i < tableData.length; i++) {
      var row = tableData[i]
      if (!row.code || !row.category) continue

      // Tạo catKey
      var catKey = row.category
      if (row.category === 'Asset' && row.featureLevels && row.featureLevels[0] && row.featureLevels[0].key) {
        catKey = 'Asset_' + row.featureLevels[0].key
      } else if (row.category === 'Job' && row.featureLevels && row.featureLevels[0] && row.featureLevels[0].key) {
        catKey = 'Job_' + row.featureLevels[0].key
      }

      if (!levels[catKey]) levels[catKey] = {}
      var leafValue = this.getLeafValue(row.featureLevels, row.category)
      if (!leafValue) continue

      var values = codeValueMap[row.code] || []
      var nonEmpty = values.filter(function(v) { return v && v.trim() !== '' })
      if (!nonEmpty.length) continue

      // Scalar: 1 giá trị. Array: giữ nguyên mảng
      levels[catKey][leafValue] = nonEmpty.length === 1 ? nonEmpty[0] : nonEmpty
    }
    return levels
  },

  // ── 3. Xác định levels cần import (dựa vào selectedNode.mode) ────────
  // selectedMode = 'organisation' → KHÔNG skip org level
  //   vì org trong Excel có thể là child org của org đã chọn
  // selectedMode = 'substation' trở xuống → skip hết các level ≥ selectedMode
  getLevelsToProcess: function(selectedMode, allLevelData) {
    var result
    if (!selectedMode || selectedMode === 'organisation') {
      // Không skip gì cả — org trong Excel sẽ được xử lý như child org
      result = LEVEL_ORDER.slice(0)
    } else {
      var skipUntil = -1
      for (var i = 0; i < LEVEL_ORDER.length; i++) {
        if (LEVEL_ORDER[i].mode === selectedMode) { skipUntil = i; break }
      }
      result = LEVEL_ORDER.slice(skipUntil + 1)
    }

    // Thêm Asset levels
    var assetCatKeys = Object.keys(allLevelData).filter(function(k) { return k.startsWith('Asset_') })
    assetCatKeys.forEach(function(catKey) {
      var assetType = catKey.replace('Asset_', '')
      var node = FEATURE_TREE.Asset && FEATURE_TREE.Asset.children && FEATURE_TREE.Asset.children[assetType]
      result.push({ id: 'asset', catKey: catKey, label: (node && node.label) || assetType, mode: 'asset', reqField: ASSET_REQ_FIELD, reqLabel: 'serial no.' })
    })

    // Thêm Job levels
    var jobCatKeys = Object.keys(allLevelData).filter(function(k) { return k.startsWith('Job_') })
    jobCatKeys.forEach(function(catKey) {
      var jobType = catKey.replace('Job_', '')
      var node = FEATURE_TREE.Job && FEATURE_TREE.Job.children && FEATURE_TREE.Job.children[catKey]
      result.push({ id: 'job', catKey: catKey, label: (node && node.label) || jobType, mode: 'job', reqField: JOB_REQ_FIELD, reqLabel: 'job name (auto-generated if has tests)' })
    })

    return result
  },

  // ── 4. Validate prerequisites ─────────────────────────────────────────
  // Returns: [{ level, field, message }]
  validatePrerequisites: function(levelsToProcess, allLevelData) {
    var errors = []
    for (var i = 0; i < levelsToProcess.length; i++) {
      var lv = levelsToProcess[i]
      var data = allLevelData[lv.catKey]
      if (!data) continue  // level không có trong template → skip tự nhiên

      // Job: nếu không có job_name nhưng có test data → auto-generate (không phải lỗi)
      if (lv.id === 'job' && !data[lv.reqField]) {
        var hasTests = Object.keys(data).some(function(k) { return k !== 'job_name' })
        if (hasTests) continue  // sẽ auto-generate tên
      }

      if (data[lv.reqField] === undefined || data[lv.reqField] === '') {
        errors.push({ level: lv.label, field: lv.reqLabel, message: lv.label + ' must have a ' + lv.reqLabel })
      }
    }
    return errors
  },

  // ── 5. Tìm entity theo name trong parent ──────────────────────────────
  async findExistingByName(levelId, name, ctx, assetType) {
    var userId = (window.store && window.store.state && window.store.state.user && window.store.state.user.user_id) ? window.store.state.user.user_id : null
    if (levelId === 'org') {
      if (ctx.organisation && ctx.organisation.mrid) {
        // ctx đã có org → tìm trong child orgs của org đó
        var rs = await window.electronAPI.getParentOrganizationByParentMrid(ctx.organisation.mrid)
        if (!rs || !rs.success) return null
        var list = rs.data || []
        return list.find(function(o) { return (o.name || o.aliasName) === name }) || null
      } else {
        // Chưa có ctx org → tìm trong root's children
        var rs = await window.electronAPI.getParentOrganizationByMrid(ROOT_MRID)
        if (!rs || !rs.success || !rs.data) return null
        var rootOrg = rs.data
        // Kiểm tra chính root org
        if ((rootOrg.name || rootOrg.aliasName) === name) return rootOrg
        // Tìm trong children của root
        var rs2 = await window.electronAPI.getParentOrganizationByParentMrid(rootOrg.mrid)
        var list = (rs2 && rs2.success && rs2.data) ? rs2.data : []
        return list.find(function(o) { return (o.name || o.aliasName) === name }) || null
      }
    }
    if (levelId === 'sub') {
      var orgMrid = ctx.organisation && ctx.organisation.mrid
      if (!orgMrid) return null
      var rs = await window.electronAPI.getSubstationsInOrganisationForUser(orgMrid, userId)
      if (!rs || !rs.success) return null
      var list = rs.data || []
      return list.find(function(s) { return s.name === name }) || null
    }
    if (levelId === 'vl') {
      var subMrid = ctx.substation && ctx.substation.mrid
      if (!subMrid) return null
      var rs = await window.electronAPI.getVoltageLevelBySubstationId(subMrid)
      if (!rs || !rs.success) return null
      var list = rs.data || []
      return list.find(function(vl) { return vl.name === name }) || null
    }
    if (levelId === 'bay') {
      var vlMrid = ctx.voltageLevel && ctx.voltageLevel.mrid
      var subMrid = ctx.substation && ctx.substation.mrid
      var rs = await window.electronAPI.getBayByVoltageBySubstationId(vlMrid || null, subMrid || null)
      if (!rs || !rs.success) return null
      var list = rs.data || []
      return list.find(function(b) { return b.name === name }) || null
    }
    if (levelId === 'asset') {
      var kindStr = assetType.replace('Asset_', '')
      var assetNode = FEATURE_TREE.Asset && FEATURE_TREE.Asset.children && FEATURE_TREE.Asset.children[kindStr]
      var kind = assetNode ? assetNode.label : kindStr

      // Asset có thể cắm vào bay HOẶC substation → thử cả 2
      var psrIds = []
      if (ctx.bay && ctx.bay.mrid) psrIds.push(ctx.bay.mrid)
      if (ctx.substation && ctx.substation.mrid && !(ctx.bay && ctx.bay.mrid === ctx.substation.mrid)) {
        psrIds.push(ctx.substation.mrid)
      }
      if (!psrIds.length) return null

      for (var pi = 0; pi < psrIds.length; pi++) {
        var rs
        // Surge arrester và Bushing dùng API riêng
        if (kind === 'Surge arrester') {
          rs = await window.electronAPI.getSurgeArresterByPsrId(psrIds[pi])
        } else if (kind === 'Bushing') {
          rs = await window.electronAPI.getBushingByPsrId(psrIds[pi])
        } else {
          rs = await window.electronAPI.getAssetByPsrIdAndKind(psrIds[pi], kind)
        }
        if (!rs || !rs.success) continue
        var list = Array.isArray(rs.data) ? rs.data : (rs.data ? [rs.data] : [])
        var found = list.find(function(a) { return a.serial_no === name || a.serial_number === name })
        if (found) return found
      }
      return null
    }
    if (levelId === 'job') {
      var assetMrid = ctx.asset && ctx.asset.mrid
      if (!assetMrid) return null
      var rs = await window.electronAPI.getOldWorkByAssetId(assetMrid)
      if (!rs || !rs.success) return null
      var list = rs.data || []
      return list.find(function(j) { return (j.name || j.job_name) === name }) || null
    }
    return null
  },

  // ── 6. Build entity + validate + insert ─────────────────────────────────
  // Dùng cấu trúc entity THỰC (nested) thay vì flat payload
  // API names lấy từ preload — theo pattern: insertParentOrganizationEntity, v.v.

  _n: function(v) { return v || '' },           // string hoặc ''
  _num: function(v) { return v ? Number(v) : null },  // number hoặc null

  // ── traverseAndFillMrid: copy từ VT mixin — fill mọi mrid field còn null ──
  // Duyệt đệ quy toàn bộ object, bất kỳ field nào tên 'mrid' mà null/empty → uuid mới
  traverseAndFillMrid: function(obj) {
    if (Array.isArray(obj)) {
      obj.forEach(function(item) { deepImportService.traverseAndFillMrid(item) })
    } else if (obj !== null && typeof obj === 'object') {
      if ('mrid' in obj && (!obj.mrid || obj.mrid === '')) {
        obj.mrid = uuid.newUuid()
      }
      Object.values(obj).forEach(function(val) { deepImportService.traverseAndFillMrid(val) })
    }
    return obj
  },

  // ── Check helpers (giống pattern LocationInsert mixin) ──────────────────
  // Assign UUIDs cho các sub-IDs trong DTO trước khi mapDtoToEntity

  _checkAndAssignId: function(dto, idField) {
    if (!dto[idField]) dto[idField] = uuid.newUuid()
  },

  // Gán userId từ store (nếu có)
  _getUserId: function() {
    try { return window.store && window.store.state && window.store.state.user ? window.store.state.user.user_id : null } catch(e) { return null }
  },
  _getUserName: function() {
    try { return window.store && window.store.state && window.store.state.user ? window.store.state.user.name : '' } catch(e) { return '' }
  },

  // Fill DTO flat fields từ lvm
  _fillDtoFlat: function(dto, lvm, fields) {
    var self = this
    fields.forEach(function(f) { if (lvm[f] !== undefined && lvm[f] !== '') dto[f] = lvm[f] })
  },

  // Trích mrid từ response — xử lý nhiều format trả về khác nhau
  _extractMrid: function(rs) {
    if (!rs || rs.success === false) return null
    // Thử các vị trí có thể có mrid
    if (rs.mrid)                           return rs.mrid
    if (rs.data && rs.data.mrid)           return rs.data.mrid
    if (rs.data && rs.data.id)             return rs.data.id
    if (typeof rs.data === 'string' && rs.data.length > 10) return rs.data
    if (rs.id)                             return rs.id
    return null
  },

  async insertEntity(lv, data, ctx, _passedUserId) {
    var orgMrid   = ctx.organisation  && ctx.organisation.mrid
    var subMrid   = ctx.substation    && ctx.substation.mrid
    var vlMrid    = ctx.voltageLevel  && ctx.voltageLevel.mrid
    var bayMrid   = ctx.bay           && ctx.bay.mrid
    var assetMrid = ctx.asset         && ctx.asset.mrid
    var userId    = _passedUserId || this._getUserId()
    var userName  = this._getUserName()
    var rs, dto, entity

    // ── Organisation ────────────────────────────────────────────────────
    if (lv.id === 'org') {
      // Lấy root org mrid thật
      var rootRs = await window.electronAPI.getParentOrganizationByMrid(ROOT_MRID)
      if (!rootRs || !rootRs.success || !rootRs.data) {
        return { success: false, message: 'Cannot load root organisation' }
      }
      var orgParentMrid = orgMrid || rootRs.data.mrid

      // Build DTO — đúng field names từ OrgDtoToOrgEntity mapper
      dto = new organisationDto()
      dto.organisationId = uuid.newUuid()     // mapper: orgEntity.organisation.mrid
      dto.parentId       = orgParentMrid       // mapper: orgEntity.organisation.parent_organisation
      dto.name           = data['name'] || ''
      dto.aliasName      = data['aliasName'] || data['name'] || ''
      dto.userId         = userId
      dto.userName       = userName
      this._fillDtoFlat(dto, data, ['tax_code','street','ward_or_commune','district_or_town',
        'city','state_or_province','postal_code','country','phoneNumber','fax','email','comment'])

      // Assign sub-IDs (giống checkSubstation trong mixin)
      if (dto.street)                                       dto.streetDetailId      = uuid.newUuid()
      var hasTown = dto.city || dto.state_or_province || dto.country || dto.district_or_town || dto.ward_or_commune
      if (hasTown)                                          dto.townDetailId        = uuid.newUuid()
      if (dto.streetDetailId || dto.townDetailId)           dto.streetAddressId     = uuid.newUuid()
      if (dto.email || dto.fax)                             dto.electronicAddressId = uuid.newUuid()
      if (dto.phoneNumber)                                  dto.telephoneNumberId   = uuid.newUuid()

      // OrgDtoToOrgEntity — tên hàm đúng từ Organisation/index.js
      entity = OrgDtoToOrgEntity(dto)
      if (!entity) return { success: false, message: 'Failed to map Organisation DTO to entity' }

      rs = await window.electronAPI.insertParentOrganizationEntity(entity)
      return { success: !!(rs && rs.success === true), mrid: this._extractMrid(rs), message: rs && rs.message }
    }

    // ── Substation ───────────────────────────────────────────────────────
    if (lv.id === 'sub') {
      if (!orgMrid) return { success: false, message: 'Cannot insert Substation: no Organisation context' }

      // Build DTO (chính xác như saveSubstation trong LocationInsert mixin)
      dto = new substationDto()
      dto.organisationId = orgMrid
      dto.name           = data['name'] || ''
      dto.aliasName      = data['aliasName'] || data['name'] || ''
      dto.userId         = userId
      dto.userName       = userName
      this._fillDtoFlat(dto, data, ['type','generation','industry','comment',
        'locationName','street','ward_or_commune','district_or_town','state_or_province',
        'city','country','personName','phoneNumber','fax','email','department','position'])

      // Assign main ID
      if (!dto.subsId) dto.subsId = uuid.newUuid()
      dto.organisationId = orgMrid   // required: organisationPsr, organisationLocation link

      // Các check functions của mixin — assign UUIDs cho sub-IDs
      if (dto.type && !dto.psrTypeId)           dto.psrTypeId           = uuid.newUuid()
      if (dto.street && !dto.streetDetailId)     dto.streetDetailId      = uuid.newUuid()
      var hasTownData = dto.city || dto.state_or_province || dto.country || dto.district_or_town || dto.ward_or_commune
      if (hasTownData && !dto.townDetailId)      dto.townDetailId        = uuid.newUuid()
      if ((dto.streetDetailId || dto.townDetailId) && !dto.streetAddressId) dto.streetAddressId = uuid.newUuid()
      if ((dto.streetAddressId || dto.locationName) && !dto.locationId)     dto.locationId      = uuid.newUuid()
      if ((dto.email || dto.fax) && !dto.electronicAddressId)               dto.electronicAddressId = uuid.newUuid()
      if (dto.phoneNumber && !dto.telephoneNumberId)                        dto.telephoneNumberId   = uuid.newUuid()
      if ((dto.department || dto.position) && !dto.personRoleId)            dto.personRoleId        = uuid.newUuid()
      if (dto.personName && !dto.personId)       dto.personId            = uuid.newUuid()
      if (dto.personId && dto.subsId && !dto.personSubstationId)            dto.personSubstationId  = uuid.newUuid()
      if (orgMrid && dto.locationId && !dto.organisationLocationId)         dto.organisationLocationId = uuid.newUuid()
      if (orgMrid && dto.personId && !dto.organisationPersonId)             dto.organisationPersonId   = uuid.newUuid()
      if (orgMrid && dto.subsId && !dto.organisationPsrId)                  dto.organisationPsrId      = uuid.newUuid()
      if (dto.subsId && userId && !dto.userIdentifiedObjectId)              dto.userIdentifiedObjectId = uuid.newUuid()

      // Map DTO → entity
      entity = subDtoToEntity(dto)   // mapDtoToEntity từ Mapping/Substation/index.js
      if (!entity) return { success: false, message: 'Failed to map Substation DTO to entity' }

      rs = await window.electronAPI.insertSubstationEntity(entity)
      return { success: !!(rs && rs.success === true), mrid: this._extractMrid(rs), message: rs && rs.message }
    }

    // ── VoltageLevel ─────────────────────────────────────────────────────
    if (lv.id === 'vl') {
      if (!subMrid) return { success: false, message: 'Cannot insert VoltageLevel: no Substation context' }

      // Build DTO — field names từ volDtoToVolEntity mapper
      dto = new voltageLevelDto()
      dto.voltageLevelId = uuid.newUuid()   // entity.voltageLevel.mrid
      dto.substationId   = subMrid           // entity.voltageLevel.substation
      dto.name           = data['name'] || ''
      dto.comment        = data['comment'] || ''
      dto.userId         = userId

      // Voltage values + assign IDs (mapper tạo Voltage objects nếu có ID)
      if (data['high_voltage_limit_value']) {
        dto.highVoltageLimitId        = uuid.newUuid()
        dto.high_voltage_limit_value  = data['high_voltage_limit_value']
        dto.high_voltage_limit_unit   = data['high_voltage_limit_unit'] || 'kV'
      }
      if (data['low_voltage_limit_value']) {
        dto.lowVoltageLimitId        = uuid.newUuid()
        dto.low_voltage_limit_value  = data['low_voltage_limit_value']
        dto.low_voltage_limit_unit   = data['low_voltage_limit_unit'] || 'kV'
      }
      if (data['base_voltage_value']) {
        dto.baseVoltageId       = uuid.newUuid()
        dto.nominalVoltageId    = uuid.newUuid()
        dto.base_voltage_value  = data['base_voltage_value']
        dto.base_voltage_unit   = data['base_voltage_unit'] || 'kV'
      }

      // volDtoToVolEntity — tên đúng từ VoltageLevel/index.js
      entity = volDtoToVolEntity(dto)
      rs = await window.electronAPI.insertVoltageLevelEntity(entity)
      return { success: !!(rs && rs.success === true), mrid: this._extractMrid(rs), message: rs && rs.message }
    }

    // ── Bay ───────────────────────────────────────────────────────────────
    if (lv.id === 'bay') {
      // Bay DTO = Flatten — không cần mapper, dùng BayDto trực tiếp
      // Field names PHẢI khớp với mapServerToDto (ServerToDTO/Bay/index.js)
      dto = new bayDto()
      var bayMridNew = uuid.newUuid()
      dto.mrid  = bayMridNew   // field đúng cho insertBayEntity
      dto.bayId = bayMridNew   // giữ lại để tương thích với BayDto class
      dto.name                   = data['name'] || ''
      dto.aliasName              = data['aliasName'] || data['name'] || ''
      // mapServerToDto: dto.voltage_level = serverData.voltageLevel?.mRID
      // Ưu tiên voltage_level; nếu không có mới dùng substation
      dto.voltage_level = vlMrid  || null
      dto.substation    = vlMrid  ? null : (subMrid || null)
      // mapServerToDto: dto.breaker_configuration (snake_case)
      dto.breaker_configuration  = data['breaker_configuration'] || ''
      dto.bus_bar_configuration  = data['bus_bar_configuration']  || ''
      dto.bay_energy_meas_flag   = ''
      dto.bay_power_meas_flag    = ''
      dto.userId                 = userId

      rs = await window.electronAPI.insertBayEntity(dto)
      return { success: !!(rs && rs.success === true), mrid: this._extractMrid(rs), message: rs && rs.message }
    }

    // ── Asset ─────────────────────────────────────────────────────────────
    if (lv.id === 'asset') {
      var psrId = bayMrid || subMrid
      if (!psrId) return { success: false, message: 'Cannot insert Asset: no Bay/Substation context' }

      // Config: mỗi asset type có mapper + DTO class + API riêng
      // Pattern từ AssetView/mixin: mapDtoToEntity(dto) → insertXxxEntity(oldEntity, entity)
      var assetConfig = {
        'Asset_VoltageTransformerDto': { DtoClass: VoltageTransformerDto, mapper: vtMapDtoToEntity,          api: 'insertVoltageTransformerEntity' },
        'Asset_CurrentTransformerDto': { DtoClass: CurrentTransformerDto, mapper: ctMapDtoToEntity,          api: 'insertCurrentTransformerEntity' },
        'Asset_TransformerDataDto':    { DtoClass: TransformerDto,        mapper: tfMapDtoToEntity,          api: 'insertTransformerEntity' },
        'Asset_CircuitBreakerDto':     { DtoClass: CircuitBreakerDto,     mapper: breakerMapDtoToEntity,     api: 'insertCircuitBreakerEntity' },
        'Asset_PowerCableDTO':         { DtoClass: PowerCableDto,         mapper: cableMapDtoToEntity,       api: 'insertPowerCableEntity' },
        'Asset_SurgeArresterDto':      { DtoClass: SurgeArresterDto,      mapper: saMapDtoToEntity,          api: 'insertSurgeArresterEntity' },
        'Asset_ReactorDto':            { DtoClass: ReactorDto,            mapper: reactorMapDtoToEntity,     api: 'insertReactorEntity' },
        'Asset_CapacitorsDTO':         { DtoClass: CapacitorDto,          mapper: capacitorMapDtoToEntity,   api: 'insertCapacitorEntity' },
        'Asset_DisconnectorDTO':       { DtoClass: DisconnectorDto,       mapper: disconnectorMapDtoToEntity, api: 'insertDisconnectorEntity' },
        'Asset_RotatingMachineDTO':    { DtoClass: RotatingMachineDto,    mapper: rotatingMapDtoToEntity,    api: 'insertRotatingMachineEntity' },
        'Asset_BushingAssetDto':       { DtoClass: BushingDto,            mapper: bushingMapDtoToEntity,     api: 'insertBushingEntity' },
      }

      var cfg = assetConfig[lv.catKey]
      if (!cfg) return { success: false, message: 'Unknown asset type: ' + lv.catKey }

      // Build DTO — fill common properties fields
      // Build DTO từ DtoClass (có đầy đủ nested structure như VT mixin)
      dto = new cfg.DtoClass()
      dto.psrId = psrId
      dto.userId = userId

      // Fill properties (flat fields → dto.properties nếu có)
      if (dto.properties) {
        dto.properties.serial_no    = data[ASSET_REQ_FIELD] || ''
        dto.properties.apparatus_id = data['apparatus_id'] || ''
        this._fillDtoFlat(dto.properties, data, ['type','manufacturer','manufacturer_type',
          'manufacturer_year','model','country_of_origin','feeder','comment'])
      }

      // CRITICAL: TẤT CẢ asset CRUD gọi JSON.parse(entity.attachment.path) ngay đầu
      // attachment.path = null → throw → insert fail
      if (!dto.attachment) dto.attachment = {}
      if (!dto.attachment.path) dto.attachment.path = '[]'
      dto.attachment.type = 'asset'

      // Assign các sub-IDs (giống checkVoltageTransformerData trong mixin)
      if (!dto.properties.mrid)   dto.properties.mrid   = uuid.newUuid()  // checkProperty
      if (!dto.lifecycleDateId)   dto.lifecycleDateId   = uuid.newUuid()  // checkLifecycleDate
      if (!dto.productAssetModelId) dto.productAssetModelId = uuid.newUuid() // checkProductAssetModel
      if (!dto.assetPsrId)        dto.assetPsrId        = uuid.newUuid()  // checkAssetPrs
      if (!dto.assetInfoId)       dto.assetInfoId       = uuid.newUuid()  // checkAssetInfoId

      // ── Type-specific initializations (từ check* functions trong từng mixin) ────
      var catKey = lv.catKey

      // VT: checkWindings → vt_Configuration.windings.mrid
      if (catKey === 'Asset_VoltageTransformerDto') {
        if (dto.vt_Configuration && dto.vt_Configuration.windings &&
            !dto.vt_Configuration.windings.mrid) {
          dto.vt_Configuration.windings.mrid = uuid.newUuid()
        }
      }

      // CT: ctConfiguration.cores phải là số nguyên hợp lệ 1-9 (CT CRUD: parseInt, must be 1-9)
      if (catKey === 'Asset_CurrentTransformerDto') {
        if (dto.ctConfiguration) {
          var cores = parseInt(dto.ctConfiguration.cores)
          dto.ctConfiguration.cores = (cores >= 1 && cores <= 9) ? cores.toString() : '1'
        }
      }

      // Transformer: oldPowerTransformerInfoId + oldTransformerEndInfo + attachment + array fields
      if (catKey === 'Asset_TransformerDataDto') {
        if (!dto.oldPowerTransformerInfoId) dto.oldPowerTransformerInfoId = uuid.newUuid()

        // CRITICAL: oldTransformerEndInfo phải có 3 items với end_number 1/2/3
        // Mapper dùng end_number để set shortCircuitTest.energised_end
        // getTransformerEntityById load shortCircuitTest qua getShortCircuitTestByTransformerEndInfoId(endInfo.mrid)
        // → nếu array rỗng → loop không chạy → prim_sec trống khi view
        if (!dto.oldTransformerEndInfo || dto.oldTransformerEndInfo.length === 0) {
          // Xác định số winding theo thứ tự ưu tiên:
          // 1. User khai báo phases trong Excel → dùng theo khai báo
          // 2. Auto-detect: có st_* (sec-tert) hoặc cr_tert → 3 winding
          // 3. Mặc định: Two winding
          // properties.type (= entity.asset.type) quyết định số winding
          // Values: 'Two-winding' | 'Three-winding' | 'Auto w/ tert' | 'Auto w/o tert'
          var assetType = data['type'] || (dto.properties && dto.properties.type) || ''
          var isThree
          if (assetType) {
            // User khai báo type trong Excel → follow theo
            isThree = (assetType === 'Three-winding' || assetType === 'Auto w/ tert')
          } else {
            // Auto-detect: có st_* (sec-tert) hoặc cr_tert → 3 winding
            var hasSecTert = !!(data['st_uk'] || data['st_base_power'] || data['st_base_voltage'])
            var hasTertCurrent = !!(data['cr_tert'])
            isThree = hasSecTert || hasTertCurrent
            // Mặc định: Two-winding
          }
          dto.oldTransformerEndInfo = [
            { mrid: uuid.newUuid(), end_number: 1 },
            { mrid: uuid.newUuid(), end_number: 2 },
          ]
          if (isThree) {
            dto.oldTransformerEndInfo.push({ mrid: uuid.newUuid(), end_number: 3 })
          }
        }

        // Ensure winding_configuration has proper structure (mapper accesses .sec.i, .tert.i)
        if (!dto.winding_configuration) dto.winding_configuration = {}
        if (!dto.winding_configuration.vector_group) dto.winding_configuration.vector_group = {}
        var vg = dto.winding_configuration.vector_group
        if (typeof vg.prim !== 'string') vg.prim = ''
        if (!vg.sec || typeof vg.sec !== 'object') vg.sec = { i: '', value: '' }
        if (!vg.tert || typeof vg.tert !== 'object') vg.tert = { i: '', value: '', accessible: null }
        if (!dto.others) dto.others = {}
        if (!dto.others.winding) dto.others.winding = { prim: null, sec: null, tert: null }

        // Build prim_sec, prim_tert, sec_tert, voltage_ratings, power_ratings, current_ratings
        this._buildTransformerArrays(dto, data)
      }

      // Breaker: nhiều info IDs
      if (catKey === 'Asset_CircuitBreakerDto') {
        if (!dto.breakerRatingInfoId)          dto.breakerRatingInfoId          = uuid.newUuid()
        if (!dto.breakerContactSystemInfoId)   dto.breakerContactSystemInfoId   = uuid.newUuid()
        if (!dto.breakerOtherInfoId)           dto.breakerOtherInfoId           = uuid.newUuid()
        if (!dto.assessmentLimitBreakerInfoId) dto.assessmentLimitBreakerInfoId = uuid.newUuid()
        if (!dto.operatingMechanismId)         dto.operatingMechanismId         = uuid.newUuid()
        if (!dto.operatingMechanismInfoId)     dto.operatingMechanismInfoId     = uuid.newUuid()
      }

      // PowerCable: oldCableInfoId
      if (catKey === 'Asset_PowerCableDTO') {
        if (!dto.oldCableInfoId) dto.oldCableInfoId = uuid.newUuid()
      }

      // SA: ratings.unitStack init
      if (catKey === 'Asset_SurgeArresterDto') {
        if (dto.ratings && (dto.ratings.unitStack === null || dto.ratings.unitStack === '')) {
          dto.ratings.unitStack = 1
        }
      }

      // traverseAndFillMrid: fill MỌI mrid field còn null trong toàn bộ nested object
      // Đây là bước quan trọng nhất — copy từ VT mixin's checkVoltageTransformerTree
      this.traverseAndFillMrid(dto)

      // Map DTO → entity (đúng pattern từ mixin)
      var entity    = cfg.mapper(dto)
      var oldEntity = cfg.mapper(new cfg.DtoClass())   // blank entity cho insert mới

      rs = await window.electronAPI[cfg.api](oldEntity, entity)
      return { success: !!(rs && rs.success === true), mrid: this._extractMrid(rs), message: rs && rs.message }
    }

    // ── Job ───────────────────────────────────────────────────────────────
    if (lv.id === 'job') {
      if (!assetMrid) return { success: false, message: 'Cannot insert Job: no Asset context' }

      // Config per asset type — jobDtoToEntity + API name
      // catKey format: 'Job_VoltageTransformerJobDto' → map sang VT job
      var jobConfig = {
        'Job_VoltageTransformerDto':  { mapper: vtJobDtoToEntity, api: 'insertVoltageTransformerJobEntity', testTypeKey: 'voltageTransformerTestingEquipmentTestType' },
        'Job_CurrentTransformerDto':  { mapper: ctJobDtoToEntity, api: 'insertCurrentTransformerJobEntity', testTypeKey: 'currentTransformerTestingEquipmentTestType' },
        'Job_TransformerDataDto':     { mapper: tfJobDtoToEntity, api: 'insertTransformerJobEntity',        testTypeKey: 'transformerTestingEquipmentTestType' },
        'Job_CircuitBreakerDto':      { mapper: brJobDtoToEntity, api: 'insertCircuitBreakerJobEntity',     testTypeKey: 'circuitBreakerTestingEquipmentTestType' },
        'Job_PowerCableDTO':          { mapper: caJobDtoToEntity, api: 'insertPowerCableJobEntity',         testTypeKey: 'powerCableTestingEquipmentTestType' },
        'Job_SurgeArresterDto':       { mapper: saJobDtoToEntity, api: 'insertSurgeArresterJobEntity',      testTypeKey: 'surgeArresterTestingEquipmentTestType' },
        'Job_ReactorDto':             { mapper: reJobDtoToEntity, api: 'insertReactorJobEntity',            testTypeKey: 'reactorTestingEquipmentTestType' },
        'Job_CapacitorsDTO':          { mapper: cpJobDtoToEntity, api: 'insertCapacitorJobEntity',          testTypeKey: 'capacitorTestingEquipmentTestType' },
        'Job_DisconnectorDTO':        { mapper: dcJobDtoToEntity, api: 'insertDisconnectorJobEntity',       testTypeKey: 'disconnectorTestingEquipmentTestType' },
        'Job_RotatingMachineDTO':     { mapper: rmJobDtoToEntity, api: 'insertRotatingMachineJobEntity',    testTypeKey: 'rotatingMachineTestingEquipmentTestType' },
        'Job_BushingAssetDto':        { mapper: buJobDtoToEntity, api: 'insertBushingJobEntity',            testTypeKey: 'bushingTestingEquipmentTestType' },
      }

      var jcfg = jobConfig[lv.catKey]
      if (!jcfg) return { success: false, message: 'Unknown job type: ' + lv.catKey }

      var jobName = data[JOB_REQ_FIELD] || this._randomJobName()
      var jobMrid = uuid.newUuid()

      // Build job DTO — mapper reads from dto.properties.*
      // (VTJobMapping: entity.oldWork.mrid = dto.properties.mrid)
      dto = {
        properties: {
          mrid:           jobMrid,          // job mrid — dùng cho syncFilesWithDeletion
          name:           jobName,
          asset_id:       assetMrid,         // link job → asset
          job_type:       this._n(data['job_type']),
          tested_by:      this._n(data['tested_by']),
          approved_by:    this._n(data['approved_by']),
          test_method:    this._n(data['test_method']),
          ref_standard:   this._n(data['ref_standard']),
          summary:        this._n(data['summary']),
          execution_date: this._n(data['execution_date']),
          approval_date:  this._n(data['approval_date']),
          creation_date:  this._n(data['creation_date']),
          type:           this._n(data['type'])
        },
        // CRITICAL: attachment.path phải là '[]' — job CRUD gọi JSON.parse(entity.attachment.path)
        attachment:   { id: null, path: '[]', name: null, type: 'job', id_foreign: assetMrid },
        attachmentId: null,
        // Arrays rỗng cho basic import (không có test data)
        testingEquipmentData: [],
        procedureAsset:       [],
        testList:             [],
        standardCustomized:   [],
        testStandard:         [],
        assessment_rule:      [],
        assessment_group:     [],
        attachmentTest:       []
      }
      // testTypeKey là field chứa equipment test types per asset type
      dto[jcfg.testTypeKey] = []

      // Map DTO → entity
      entity = jcfg.mapper(dto)

      // Blank oldEntity cho diff (all arrays empty)
      var oldJobEntity = jcfg.mapper({
        properties: { mrid: null, name: null, asset_id: null },
        attachment: { id: null, path: '[]' },
        attachmentId: null,
        testingEquipmentData: [], procedureAsset: [], testList: [],
        standardCustomized: [], testStandard: [], assessment_rule: [],
        assessment_group: [], attachmentTest: []
      })
      oldJobEntity[jcfg.testTypeKey] = []

      rs = await window.electronAPI[jcfg.api](oldJobEntity, entity)
      return { success: !!(rs && rs.success === true), mrid: this._extractMrid(rs), message: rs && rs.message }
    }

    return { success: false, message: 'Unknown level: ' + lv.id }
  },

    // ── 7. Overwrite entity (giữ MRID, ghi đè fields) ────────────────────
  async overwriteEntity(lv, existing, data, ctx) {
    // Merge: lấy existing entity đầy đủ rồi ghi đè các fields từ data
    var mrid = existing.mrid
    if (lv.id === 'org') {
      var rs = await window.electronAPI.getOrganisationEntityByMrid(mrid)
      if (!rs || !rs.success || !rs.data) return { success: false }
      var e = rs.data
      this._applyFlat(e, data, ['name','aliasName','tax_code','street','ward_or_commune','district_or_town','city','state_or_province','postal_code','country','phoneNumber','fax','email','comment'])
      return await window.electronAPI.updateOrganisation(e)
    }
    if (lv.id === 'sub') {
      var rs = await window.electronAPI.getSubstationEntityByMrid(mrid)
      if (!rs || !rs.success || !rs.data) return { success: false }
      var e = rs.data
      this._applyFlat(e, data, ['name','aliasName','type','generation','industry','locationName','street','ward_or_commune','district_or_town','state_or_province','city','country','personName','department','position','phoneNumber','fax','email','comment'])
      return await window.electronAPI.updateSubstation(e)
    }
    if (lv.id === 'vl') {
      var rs = await window.electronAPI.getVoltageLevelEntityByMrid(mrid)
      if (!rs || !rs.success || !rs.data) return { success: false }
      var e = rs.data
      this._applyFlat(e, data, ['name','comment','high_voltage_limit_value','low_voltage_limit_value','base_voltage_value'])
      return await window.electronAPI.updateVoltageLevel(e)
    }
    if (lv.id === 'bay') {
      var rs = await window.electronAPI.getBayEntityByMrid(mrid)
      if (!rs || !rs.success || !rs.data) return { success: false }
      var e = rs.data
      this._applyFlat(e, data, ['name','aliasName','breaker_configuration','bus_bar_configuration'])
      return await window.electronAPI.updateBay(e)
    }
    if (lv.id === 'asset') {
      // Fetch và update entity qua API tương ứng
      return { success: false, message: 'Asset overwrite: implement per asset type' }
    }
    if (lv.id === 'job') {
      var rs = await window.electronAPI.getJobByMrid(mrid)
      if (!rs || !rs.success || !rs.data) return { success: false }
      var e = rs.data
      var jobFields = ['job_type','tested_by','approved_by','test_method','ref_standard','summary','execution_date','approval_date']
      this._applyFlat(e, data, jobFields)
      if (data[JOB_REQ_FIELD]) e.name = data[JOB_REQ_FIELD]
      return await window.electronAPI.updateJob(e)
    }
    return { success: false, message: 'Unknown level' }
  },

  // ── 8. Phân tích các quyết định cần hỏi user trước khi import ──────────
  // Trả về: [{ key, label, issue, choice: null, catKey?, generatedValue? }]
  analyzeDecisionsNeeded: function(allLevelData, levelsToProcess) {
    var decisions = []
    var processed = {}  // catKey → true
    var self = this

    // ── Case 1: Level thiếu required field nhưng có level con có data ────
    // Ví dụ: SubstationDto không có name nhưng Asset có serial_no
    // → hỏi "auto-gen name cho Substation ko?"
    var dependencyMap = {
      'org':  ['sub', 'vl', 'bay', 'asset', 'job'],
      'sub':  ['vl', 'bay', 'asset', 'job'],
      'vl':   ['bay', 'asset', 'job'],
      'bay':  ['asset', 'job'],
      'asset':['job'],
    }

    for (var i = 0; i < levelsToProcess.length; i++) {
      var lv = levelsToProcess[i]
      if (processed[lv.id]) continue
      var data = allLevelData[lv.catKey]
      if (!data || !Object.keys(data).length) continue  // không có data → skip bình thường

      var reqVal = data[lv.reqField]
      if (reqVal) continue  // có required field → không cần hỏi

      // Thiếu required field — kiểm tra xem có level con nào có data không
      var deps = dependencyMap[lv.id] || []
      var hasChildData = deps.some(function(depId) {
        return levelsToProcess.some(function(dlv) {
          if (dlv.id !== depId) return false
          var ddata = allLevelData[dlv.catKey]
          return ddata && Object.keys(ddata).length > 0
        })
      })

      if (hasChildData) {
        decisions.push({
          key: 'missing_name_' + lv.id,
          type: 'missing_name',
          levelId: lv.id,
          catKey: lv.catKey,
          label: lv.label,
          reqField: lv.reqField,
          issue: lv.label + ' has no ' + lv.reqLabel + ' in Excel, but child data exists below it',
          choice: null,   // 'generate' | 'skip'
          generatedValue: null
        })
        processed[lv.id] = true
      }
    }

    // ── Case 2: Có org + job/test nhưng thiếu sub + asset (cả 2 đều thiếu) ──
    // → hỏi "random sub + asset để chứa job/test không?"
    var hasOrg    = !!(allLevelData['OrgEntityToOrgDto'] && Object.keys(allLevelData['OrgEntityToOrgDto']).length)
    var hasJobData = levelsToProcess.some(function(lv) {
      return lv.id === 'job' && allLevelData[lv.catKey] && Object.keys(allLevelData[lv.catKey]).length
    })
    var hasSubName = !!(allLevelData['SubstationDto'] && allLevelData['SubstationDto']['name'])
    var hasAssetSerial = levelsToProcess.some(function(lv) {
      return lv.id === 'asset' && allLevelData[lv.catKey] && allLevelData[lv.catKey][ASSET_REQ_FIELD]
    })

    if (hasJobData && !hasSubName && !hasAssetSerial &&
        !decisions.some(function(d) { return d.levelId === 'sub' })) {
      decisions.push({
        key: 'shortcut_org_to_job',
        type: 'shortcut',
        label: 'Auto-generate Substation + Asset',
        issue: 'Job/Test data found but no Substation name or Asset serial number. ' +
               'Need to auto-generate intermediate levels to hold the Job.',
        choice: null,
        generatedValues: {}  // { sub_name, asset_serial }
      })
    }

    return decisions
  },

  // ── 8b. Apply decisions vào allLevelData trước khi import ────────────────
  applyDecisions: function(decisions, allLevelData) {
    for (var i = 0; i < decisions.length; i++) {
      var d = decisions[i]
      if (d.type === 'missing_name') {
        if (d.choice === 'generate' && d.generatedValue) {
          // Điền generated value vào required field
          if (!allLevelData[d.catKey]) allLevelData[d.catKey] = {}
          allLevelData[d.catKey][d.reqField] = d.generatedValue
        } else if (d.choice === 'skip') {
          // Xóa data level này để importHierarchy tự skip
          delete allLevelData[d.catKey]
        }
      } else if (d.type === 'shortcut' && d.choice === 'generate') {
        // Thêm Sub + Asset với tên random vào allLevelData
        if (!allLevelData['SubstationDto']) allLevelData['SubstationDto'] = {}
        if (!allLevelData['SubstationDto']['name']) {
          allLevelData['SubstationDto']['name'] = d.generatedValues.sub_name
        }
        // Tìm catKey của asset level
        var assetKey = Object.keys(allLevelData).find(function(k) { return k.startsWith('Asset_') })
        if (!assetKey) {
          // Không có asset data gì → tạo placeholder để chứa job
          assetKey = 'Asset_VoltageTransformerDto'  // fallback type
          allLevelData[assetKey] = {}
        }
        if (!allLevelData[assetKey][ASSET_REQ_FIELD]) {
          allLevelData[assetKey][ASSET_REQ_FIELD] = d.generatedValues.asset_serial
        }
      }
      // choice === 'skip' cho shortcut → không làm gì, job sẽ bị skip do thiếu parent
    }
    return allLevelData
  },

  // ── 9. Helper: generate random short ID ──────────────────────────────────
  _randomId: function(prefix) {
    var id = (prefix || '') + Date.now().toString(36).toUpperCase() +
             Math.random().toString(36).slice(2, 6).toUpperCase()
    return id
  },

  // ── Multi-occurrence helpers ─────────────────────────────────────────────
  // Lấy danh sách giá trị unique của reqField (dedup) kèm index
  // Ví dụ: data.name = ['Sub1','Sub2','Sub1'] → [{reqVal:'Sub1',index:0},{reqVal:'Sub2',index:1}]
  _getOccurrences: function(data, reqField) {
    var reqVals = data[reqField]
    if (!Array.isArray(reqVals)) reqVals = (reqVals && String(reqVals).trim()) ? [reqVals] : []
    var seen = {}, result = []
    reqVals.forEach(function(v, i) {
      var t = v ? String(v).trim() : ''
      if (t && !seen[t]) { seen[t] = true; result.push({ reqVal: t, index: i }) }
    })
    return result
  },

  // Lấy data cho 1 occurrence cụ thể
  //
  // Phân biệt 2 loại array:
  //   1. reqField là ARRAY  → multi-entity mode → INDEX tất cả array fields
  //      vd: serial_no:['VT-01','VT-02'] + rated_burden:['100','50'] → VT-01/100, VT-02/50
  //   2. reqField là SCALAR → single-entity mode → GIỮ NGUYÊN array fields
  //      vd: serial_no:'Transformer' + ps_uk:['1','2'] → 1 transformer có 2 prim_sec rows
  _getOccurrenceData: function(data, index, reqField) {
    var reqVal = data[reqField]
    var isMultiEntity = Array.isArray(reqVal)  // reqField là array → nhiều entity
    var result = {}
    Object.keys(data).forEach(function(key) {
      var val = data[key]
      if (Array.isArray(val) && isMultiEntity) {
        // Multi-entity: lấy giá trị theo index (mỗi occurrence 1 giá trị)
        result[key] = index < val.length ? val[index] : (val.length > 0 ? val[val.length - 1] : '')
      } else {
        // Single-entity hoặc scalar: giữ nguyên (array = internal data rows)
        result[key] = val
      }
    })
    return result
  },

  // ── Sau khi insert: tìm lại entity bằng name nếu response không trả mrid ──────
  // Cần thiết vì nhiều API insert trả { success: true } mà không kèm mrid
  async _findMridAfterInsert(lv, reqVal, ctx, _passedUserId) {
    var userId = _passedUserId || this._getUserId()
    try {
      if (lv.id === 'org') {
        var parentMrid = ctx.organisation && ctx.organisation.mrid
        var list = []
        if (parentMrid) {
          // Có parent org → tìm trong children của parent đó
          var rs = await window.electronAPI.getParentOrganizationByParentMrid(parentMrid)
          list = (rs && rs.success && rs.data)
            ? (Array.isArray(rs.data) ? rs.data : [rs.data]) : []
        } else {
          // Không có parent → lấy root org, rồi tìm trong root's children
          var rootRs = await window.electronAPI.getParentOrganizationByMrid(ROOT_MRID)
          if (rootRs && rootRs.success && rootRs.data) {
            var rootOrg = rootRs.data
            var childRs = await window.electronAPI.getParentOrganizationByParentMrid(rootOrg.mrid)
            list = (childRs && childRs.success && childRs.data)
              ? (Array.isArray(childRs.data) ? childRs.data : [childRs.data]) : []
          }
        }
        var found = list.find(function(o) { return (o.name || o.aliasName) === reqVal })
        return found ? found.mrid : null
      }
      if (lv.id === 'sub') {
        var orgMrid = ctx.organisation && ctx.organisation.mrid
        if (!orgMrid) return null
        var rs = await window.electronAPI.getSubstationsInOrganisationForUser(orgMrid, userId)
        var list = (rs && rs.success && rs.data) ? rs.data : []
        var found = list.find(function(s) { return s.name === reqVal })
        return found ? found.mrid : null
      }
      if (lv.id === 'vl') {
        var subMrid = ctx.substation && ctx.substation.mrid
        if (!subMrid) return null
        var rs = await window.electronAPI.getVoltageLevelBySubstationId(subMrid)
        var list = (rs && rs.success && rs.data) ? rs.data : []
        var found = list.find(function(vl) { return vl.name === reqVal })
        return found ? found.mrid : null
      }
      if (lv.id === 'bay') {
        var vlMrid  = ctx.voltageLevel && ctx.voltageLevel.mrid
        var subMrid = ctx.substation   && ctx.substation.mrid
        var rs = await window.electronAPI.getBayByVoltageBySubstationId(vlMrid || null, subMrid || null)
        var list = (rs && rs.success && rs.data) ? rs.data : []
        var found = list.find(function(b) { return b.name === reqVal })
        return found ? found.mrid : null
      }
      if (lv.id === 'asset') {
        var psrId = (ctx.bay && ctx.bay.mrid) || (ctx.substation && ctx.substation.mrid)
        if (!psrId) return null
        var rs = await window.electronAPI.getAssetByPsrIdAndKind(psrId, 'all')
        var list = (rs && rs.success && rs.data) ? (Array.isArray(rs.data) ? rs.data : [rs.data]) : []
        var found = list.find(function(a) { return a.serial_no === reqVal || a.serial_number === reqVal })
        return found ? found.mrid : null
      }
    } catch(e) {
      console.warn('_findMridAfterInsert error:', lv.id, e.message)
    }
    return null
  },

  // ── Build Transformer array fields từ lvm ──────────────────────────────
  // Mapper reads: item.short_circuit_impedances_uk.mrid, item.base_power.mrid,
  //               item.base_power.data.mrid, item.base_voltage.data.mrid, item.load_losses_pk.mrid
  _makeMeasure: function(value) {
    return { mrid: uuid.newUuid(), value: value || null, unit: null, multiplier: null }
  },
  _makeBaseMeasure: function(value) {
    return { mrid: uuid.newUuid(), data: { mrid: uuid.newUuid(), value: value || null, unit: null, multiplier: null } }
  },
  _buildImpedanceItems: function(lvm, ukKey, bpKey, bvKey, llKey) {
    var self = this
    // Dùng maxLen từ bất kỳ field nào có data — không cứng vào ukKey
    function arrLen(key) {
      if (!lvm[key]) return 0
      return Array.isArray(lvm[key]) ? lvm[key].length : 1
    }
    function getVal(key, i) {
      if (!lvm[key]) return null
      return Array.isArray(lvm[key]) ? (lvm[key][i] || null) : lvm[key]
    }
    var maxLen = Math.max(arrLen(ukKey), arrLen(bpKey), arrLen(bvKey), arrLen(llKey))
    if (maxLen === 0) return []
    var result = []
    for (var i = 0; i < maxLen; i++) {
      result.push({
        mrid:                       uuid.newUuid(),
        short_circuit_impedances_uk: self._makeMeasure(getVal(ukKey, i)),
        base_power:                  self._makeBaseMeasure(getVal(bpKey, i)),
        base_voltage:                self._makeBaseMeasure(getVal(bvKey, i)),
        load_losses_pk:              self._makeMeasure(getVal(llKey, i))
      })
    }
    return result
  },

  _buildTransformerArrays: function(dto, lvm) {
    // prim_sec (ps_*), prim_tert (pt_*), sec_tert (st_*)
    var ps = this._buildImpedanceItems(lvm, 'ps_uk', 'ps_base_power', 'ps_base_voltage', 'ps_load_losses')
    var pt = this._buildImpedanceItems(lvm, 'pt_uk', 'pt_base_power', 'pt_base_voltage', 'pt_load_losses')
    var st = this._buildImpedanceItems(lvm, 'st_uk', 'st_base_power', 'st_base_voltage', 'st_load_losses')
    if (ps.length) dto.impedances.prim_sec = ps
    if (pt.length) dto.impedances.prim_tert = pt
    if (st.length) dto.impedances.sec_tert = st

    // CRITICAL: dto.shortCircuitTestTransformerEndInfo phải có item cho mỗi test
    // Mapper lookup: dto.shortCircuitTestTransformerEndInfo[j].short_circuit_test_id === item.mrid
    // → mới tạo entity.shortCircuitTestTransformerEndInfo
    // → entityToDto dùng để biết test nào thuộc prim_sec/prim_tert/sec_tert
    dto.shortCircuitTestTransformerEndInfo = []
    ps.forEach(function(item) {
      dto.shortCircuitTestTransformerEndInfo.push({
        mrid: uuid.newUuid(),
        short_circuit_test_id: item.mrid   // link test → sec end (mapper tự set transformer_end_info_id = sec_mrid)
      })
    })
    pt.forEach(function(item) {
      dto.shortCircuitTestTransformerEndInfo.push({
        mrid: uuid.newUuid(),
        short_circuit_test_id: item.mrid   // link test → tert end (mapper tự set transformer_end_info_id = tert_mrid)
      })
    })
    // sec_tert: dùng chung transformer_end_info với pt (mapper xử lý riêng)
    st.forEach(function(item) {
      dto.shortCircuitTestTransformerEndInfo.push({
        mrid: uuid.newUuid(),
        short_circuit_test_id: item.mrid
      })
    })

    // voltage_ratings (vr_*)
    var vrLen = Math.max(
      Array.isArray(lvm['vr_winding'])   ? lvm['vr_winding'].length   : 0,
      Array.isArray(lvm['vr_voltage_ll']) ? lvm['vr_voltage_ll'].length : 0
    )
    if (vrLen > 0) {
      dto.ratings.voltage_ratings = []
      for (var i = 0; i < vrLen; i++) {
        dto.ratings.voltage_ratings.push({
          mrid:               uuid.newUuid(),
          winding:            Array.isArray(lvm['vr_winding'])   ? (lvm['vr_winding'][i]   || '') : '',
          voltage_ll:         { mrid: uuid.newUuid(), value: Array.isArray(lvm['vr_voltage_ll']) ? (lvm['vr_voltage_ll'][i] || null) : null, unit: null, multiplier: null },
          voltage_ln:         { mrid: uuid.newUuid(), value: Array.isArray(lvm['vr_voltage_ln']) ? (lvm['vr_voltage_ln'][i] || null) : null, unit: null, multiplier: null },
          insul_level_ll:     { mrid: uuid.newUuid(), value: Array.isArray(lvm['vr_insul_level_ll']) ? (lvm['vr_insul_level_ll'][i] || null) : null, unit: null, multiplier: null },
          insulation_class:   Array.isArray(lvm['vr_insulation_class'])   ? (lvm['vr_insulation_class'][i]   || '') : '',
          voltage_regulation: Array.isArray(lvm['vr_voltage_regulation']) ? (lvm['vr_voltage_regulation'][i] || '') : ''
        })
      }
    }

    // power_ratings (pr_*)
    var prLen = Math.max(
      Array.isArray(lvm['pr_rated_power'])   ? lvm['pr_rated_power'].length   : 0,
      Array.isArray(lvm['pr_cooling_class']) ? lvm['pr_cooling_class'].length : 0
    )
    if (prLen > 0) {
      dto.ratings.power_ratings = []
      for (var i = 0; i < prLen; i++) {
        dto.ratings.power_ratings.push({
          mrid:          uuid.newUuid(),
          rated_power:   { mrid: uuid.newUuid(), value: Array.isArray(lvm['pr_rated_power']) ? (lvm['pr_rated_power'][i] || null) : null, unit: null, multiplier: null },
          cooling_class: Array.isArray(lvm['pr_cooling_class']) ? (lvm['pr_cooling_class'][i] || '') : '',
          temp_rise_wind: { mrid: uuid.newUuid(), value: Array.isArray(lvm['pr_temp_rise_wind']) ? (lvm['pr_temp_rise_wind'][i] || null) : null, unit: null, multiplier: null }
        })
      }
    }

    // current_ratings (cr_*)
    var crLen = Math.max(
      Array.isArray(lvm['cr_prim']) ? lvm['cr_prim'].length : 0,
      Array.isArray(lvm['cr_sec'])  ? lvm['cr_sec'].length  : 0
    )
    if (crLen > 0) {
      dto.ratings.current_ratings = []
      for (var i = 0; i < crLen; i++) {
        dto.ratings.current_ratings.push({
          mrid: uuid.newUuid(),
          prim: { mrid: uuid.newUuid(), data: { mrid: uuid.newUuid(), value: Array.isArray(lvm['cr_prim']) ? (lvm['cr_prim'][i] || null) : null, unit: null, multiplier: null } },
          sec:  { mrid: uuid.newUuid(), data: { mrid: uuid.newUuid(), value: Array.isArray(lvm['cr_sec'])  ? (lvm['cr_sec'][i]  || null) : null, unit: null, multiplier: null } },
          tert: { mrid: uuid.newUuid(), data: { mrid: uuid.newUuid(), value: Array.isArray(lvm['cr_tert']) ? (lvm['cr_tert'][i] || null) : null, unit: null, multiplier: null } }
        })
      }
    }
  },

  // ── 8. Main import ────────────────────────────────────────────────────
  // selectedNode: { mode, context: { organisation:{mrid}, substation:{mrid}, ... } }
  // overwrite: boolean — true=ghi đè, false=chỉ dùng làm parent context
  async importHierarchy(codeValueMap, tableData, selectedNode, overwrite, decisions, userId) {
    var allLevelData = this.buildAllLevelData(codeValueMap, tableData)
    var selectedMode = selectedNode ? selectedNode.mode : null
    var levelsToProcess = this.getLevelsToProcess(selectedMode, allLevelData)

    // Apply decisions trước khi import
    if (decisions && decisions.length) {
      allLevelData = this.applyDecisions(decisions, allLevelData)
    }

    // Khởi tạo context từ selected node (các MRID đã biết)
    var ctx = {}
    if (selectedNode && selectedNode.context) {
      ctx = Object.assign({}, selectedNode.context)
    }

    var results = []
    var _userId = userId || this._getUserId()   // prefer passed userId

    for (var i = 0; i < levelsToProcess.length; i++) {
      var lv = levelsToProcess[i]
      var data = allLevelData[lv.catKey]

      // Level này không có trong template → skip
      if (!data || Object.keys(data).length === 0) {
        results.push({ level: lv.label, catKey: lv.catKey, skipped: true, reason: 'No data in template' })
        continue
      }

      // ── Multi-occurrence: cùng catKey có thể có nhiều giá trị khác nhau ─────
      // ['Sub1','Sub2'] → 2 sub  |  ['Sub1','Sub1'] → dedup → 1 sub
      // ['VT-01','VT-02'] → 2 VT |  scalar → 1 entity
      var occurrences = this._getOccurrences(data, lv.reqField)

      // Job: auto-generate name nếu có test data nhưng không có tên
      var isJobWithTests = lv.id === 'job' && occurrences.length === 0 && Object.keys(data).length > 0
      if (isJobWithTests) occurrences = [{ reqVal: this._randomJobName(), index: 0 }]

      if (occurrences.length === 0) {
        results.push({ level: lv.label, catKey: lv.catKey, skipped: true, reason: 'Missing required field: ' + lv.reqLabel })
        continue
      }

      for (var oi = 0; oi < occurrences.length; oi++) {
        var occ     = occurrences[oi]
        var reqVal  = occ.reqVal
        var occData = this._getOccurrenceData(data, occ.index, lv.reqField)  // reqField quyết định single vs multi entity mode

        try {
          var existing = await this.findExistingByName(lv.id, reqVal, ctx, lv.catKey)

          if (existing) {
            if (overwrite) {
              var rs = await this.overwriteEntity(lv, existing, occData, ctx)
              var ok = rs && (rs.success !== false)
              if (oi === 0) ctx = this._updateCtx(ctx, lv.id, existing.mrid, reqVal)
              results.push({ level: lv.label, catKey: lv.catKey, action: 'overwritten', name: reqVal, success: ok, mrid: existing.mrid })
            } else {
              if (oi === 0) ctx = this._updateCtx(ctx, lv.id, existing.mrid, reqVal)
              results.push({ level: lv.label, catKey: lv.catKey, action: 'used_existing', name: reqVal, success: true, mrid: existing.mrid })
            }
          } else {
            var rs = await this.insertEntity(lv, occData, ctx, _userId)
            var ok = !!(rs && rs.success === true)
            var newMrid = ok ? this._extractMrid(rs) : null
            if (ok && !newMrid) newMrid = await this._findMridAfterInsert(lv, reqVal, ctx, _userId)
            if (oi === 0 && newMrid) ctx = this._updateCtx(ctx, lv.id, newMrid, reqVal)
            results.push({ level: lv.label, catKey: lv.catKey, action: 'inserted', name: reqVal, success: ok, mrid: newMrid, error: ok ? null : (rs && rs.message) })
          }
        } catch(e) {
          results.push({ level: lv.label, catKey: lv.catKey, action: 'error', name: reqVal, success: false, error: e.message })
        }
      } // end occurrences
    }

    return { success: true, results: results }
  },

  // ── Helpers ───────────────────────────────────────────────────────────
  _applyFlat: function(target, source, fields) {
    for (var i = 0; i < fields.length; i++) {
      var f = fields[i]
      if (source[f] !== undefined) target[f] = source[f]
    }
  },
  _updateCtx: function(ctx, levelId, mrid, name) {
    var result = Object.assign({}, ctx)
    var ctxMap = { org:'organisation', sub:'substation', vl:'voltageLevel', bay:'bay', asset:'asset', job:'job' }
    var key = ctxMap[levelId]
    if (key) result[key] = { mrid: mrid, name: name }
    return result
  },
  _randomJobName: function() {
    return 'JOB-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase()
  }
}