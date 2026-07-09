/* eslint-disable */
/**
 * templateImport.js — Import Testing equipment từ file Excel/Word theo template.
 * TÁCH BIỆT với deep import của cây org→job (Import/services) — không dùng chung.
 *
 * Quy ước occurrence-indexed (giống arrayMap của export):
 *   - Số thiết bị = max length các field Properties (mỗi dòng Excel = 1 thiết bị).
 *   - Nested (cal_*, lic_*):
 *       + nhiều thiết bị  → record thứ i thuộc thiết bị thứ i (index-aligned)
 *       + 1 thiết bị      → toàn bộ records thuộc thiết bị đó
 *
 * Trước khi insert: check trùng (mrid) hoặc (manufacturer, serial, type)
 * — dùng chung services/duplicateCheck.js với import JSON của list.vue.
 */
import uuid from '@/utils/uuid'
import { FEATURE_TREE } from '@/views/Common/constants'
import TestingEquipmentDto from '@/views/Dto/TestingEquipment'
import { mapDtoToEntity } from '@/views/Mapping/TestingEquipment'
import { splitByDuplicate, loadExistingList } from './duplicateCheck'

export const TE_CAT_KEY = 'TestingEquipmentDto'
const INSERT_API = 'insertTestingEquipmentEntity'   // insertTestingEquipmentEntity(oldEntity, entity)

// Field lá thuộc PropertiesDto — khớp FEATURE_TREE.TestingEquipmentDto.PropertiesDto
const PROP_FIELDS = ['name', 'type', 'serial_no', 'manufacturer', 'model', 'manufacturer_year',
    'asset_tag', 'status', 'country_of_origin', 'in_use_date', 'comment', 'is_accessory']
const LEGACY_LEAF_ALIASES = {
    purchase_date: 'in_use_date'
}
// Field nested — leaf value có prefix trong FEATURE_TREE
const CAL_FIELDS = ['calibration_date', 'due_date', 'interval_months', 'provider', 'certificate_number', 'result', 'notes']
const LIC_FIELDS = ['option_name', 'license_key', 'enabled', 'description', 'activation_date', 'expiry_date']
const REP_FIELDS = ['created_date_time', 'reason', 'provider', 'cost', 'status']
const SERIAL_AWARE_PROP_FIELDS = ['name', 'type', 'manufacturer', 'model', 'manufacturer_year',
    'asset_tag', 'status', 'country_of_origin', 'in_use_date', 'comment']
const SERIAL_AWARE_NESTED_FIELDS = {
    cal_: ['calibration_date', 'due_date', 'interval_months', 'provider', 'certificate_number', 'result', 'notes'],
    lic_: ['option_name', 'license_key', 'enabled', 'description', 'activation_date', 'expiry_date'],
    rep_: ['created_date_time', 'reason', 'provider', 'cost', 'status']
}
const SHARED_LIST_NESTED_FIELDS = {
    lic_: ['option_name']
}
const DATE_NESTED_FIELDS = {
    cal_: ['calibration_date', 'due_date'],
    lic_: ['activation_date', 'expiry_date'],
    rep_: ['created_date_time']
}
// LƯU Ý: usage history KHÔNG import — nó là dữ liệu SUY RA từ job/test
// (bảng <asset>_testing_equipment_test_type), chỉ có ở chiều export.

const truthy = (v) => v === 1 || v === '1' || String(v).toLowerCase() === 'true'
const MONTHS = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12
}
const toIsoDate = (year, month, day) => {
    const yyyy = Number(year)
    const mm = Number(month)
    const dd = Number(day)
    if (!Number.isInteger(yyyy) || !Number.isInteger(mm) || !Number.isInteger(dd)) return ''
    if (yyyy < 1900 || yyyy > 2100 || mm < 1 || mm > 12 || dd < 1 || dd > 31) return ''
    const date = new Date(Date.UTC(yyyy, mm - 1, dd))
    if (date.getUTCFullYear() !== yyyy || date.getUTCMonth() !== mm - 1 || date.getUTCDate() !== dd) return ''
    return `${String(yyyy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`
}
const normalizeYear = (year) => {
    const text = String(year)
    if (text.length === 2) return Number(text) >= 70 ? `19${text}` : `20${text}`
    return text
}
const normalizeNumericDate = (a, b, c) => {
    const y = normalizeYear(c)
    const first = Number(a)
    const second = Number(b)
    if (first > 12 && second <= 12) return toIsoDate(y, second, first)
    if (second > 12 && first <= 12) return toIsoDate(y, first, second)
    return toIsoDate(y, second, first) || toIsoDate(y, first, second)
}
const normalizeExcelSerialDate = (value) => {
    const n = Number(value)
    if (!Number.isFinite(n) || n < 25000 || n > 80000) return ''
    const epoch = Date.UTC(1899, 11, 30)
    const date = new Date(epoch + Math.round(n) * 86400000)
    return toIsoDate(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
}
const normalizeDate = (v) => {
    if (v == null || String(v).trim() === '') return ''
    if (v instanceof Date && !isNaN(v.getTime())) return v.toISOString().slice(0, 10)
    if (typeof v === 'number') {
        if (v >= 1900 && v <= 2100 && Number.isInteger(v)) return toIsoDate(v, 1, 1)
        return normalizeExcelSerialDate(v)
    }
    const text = String(v).trim()
    const yearOnly = text.match(/^(\d{4})$/)
    if (yearOnly) return toIsoDate(yearOnly[1], 1, 1)
    const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) return toIsoDate(iso[1], iso[2], iso[3])
    const compact = text.match(/^(\d{4})(\d{2})(\d{2})$/)
    if (compact) return toIsoDate(compact[1], compact[2], compact[3])
    const ymd = text.match(/^(\d{4})[/.](\d{1,2})[/.](\d{1,2})$/)
    if (ymd) return toIsoDate(ymd[1], ymd[2], ymd[3])
    const numeric = text.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2}|\d{4})$/)
    if (numeric) return normalizeNumericDate(numeric[1], numeric[2], numeric[3])
    const namedDayFirst = text.match(/^(\d{1,2})(?:st|nd|rd|th)?[-\s,/]+([A-Za-z]{3,9})[-\s,/]+(\d{2}|\d{4})$/i)
    if (namedDayFirst) return toIsoDate(normalizeYear(namedDayFirst[3]), MONTHS[namedDayFirst[2].toLowerCase()], namedDayFirst[1])
    const namedMonthFirst = text.match(/^([A-Za-z]{3,9})[-\s,/]+(\d{1,2})(?:st|nd|rd|th)?(?:,)?[-\s,/]+(\d{2}|\d{4})$/i)
    if (namedMonthFirst) return toIsoDate(normalizeYear(namedMonthFirst[3]), MONTHS[namedMonthFirst[1].toLowerCase()], namedMonthFirst[2])
    const serial = normalizeExcelSerialDate(text)
    if (serial) return serial
    return ''
}
const normalizeDateField = (obj, key) => {
    if (!obj || !obj[key]) return
    const value = normalizeDate(obj[key])
    if (value) obj[key] = value
}
const isYearOnlyDate = (v) => /^\d{4}$/.test(String(v == null ? '' : v).trim())
const dateYear = (v) => String(v || '').slice(0, 4)
const isBlankSerial = (v) => {
    const text = String(v == null ? '' : v).trim()
    return !text || /^[-–—]+$/.test(text)
}

export const templateImport = {

    getLeafValue(featureLevels, category) {
        if (!featureLevels || !featureLevels.length) return null
        let node = FEATURE_TREE[category] || FEATURE_TREE[TE_CAT_KEY]
        if (!node) return null
        for (const level of featureLevels) {
            if (!level.key) break
            node = node.children && node.children[level.key]
            if (!node) return null
        }
        return (node && node.value !== undefined) ? node.value : null
    },

    // {code:[vals]} + tableData → { leafValue: [v0, v1, ...] } (luôn giữ dạng mảng)
    buildLeafValueMap(codeValueMap, tableData, codeSheetMap) {
        const lvm = {}
        const sheetsByLeaf = {}
        for (const row of tableData) {
            if (!row.code) continue
            const rawLeaf = this.getLeafValue(row.featureLevels, row.category || TE_CAT_KEY)
            const leaf = LEGACY_LEAF_ALIASES[rawLeaf] || rawLeaf
            if (!leaf) continue
            const raw = codeValueMap[row.code] || []
            const sheetRaw = codeSheetMap && codeSheetMap[row.code] ? codeSheetMap[row.code] : []
            const rawValues = Array.isArray(raw) ? raw : [raw]
            const rawSheets = Array.isArray(sheetRaw) ? sheetRaw : [sheetRaw]
            const values = rawValues.map(v => (v === null || v === undefined) ? '' : v)
            const sheets = values.map((v, index) => rawSheets[index] || '')
            const hasValue = values.some(v => v !== null && v !== undefined && String(v).trim() !== '')
            if (!hasValue) continue
            lvm[leaf] = values
            sheetsByLeaf[leaf] = sheets
        }
        lvm.__sheetsByLeaf = sheetsByLeaf
        return lvm
    },

    // Mỗi occurrence index = 1 thiết bị
    buildDtos(lvm, userId, manufacturerBySheet) {
        const count = PROP_FIELDS.reduce((m, f) => Math.max(m, (lvm[f] || []).length), 0)
        const dtos = []
        for (let i = 0; i < count; i++) {
            const rawSerial = lvm.serial_no && lvm.serial_no[i] !== undefined ? lvm.serial_no[i] : ''
            const serials = this.splitSerials(rawSerial)
            const serialValues = (serials.length ? serials : [rawSerial]).filter(serial => !isBlankSerial(serial))
            if (!serialValues.length) continue
            const rowSheet = this.getSheetForIndex(lvm, i)

            serialValues.forEach(serial => {
                const dto = new TestingEquipmentDto()
                const mrid = uuid.newUuid()
                dto.mrid = mrid
                dto.properties.mrid = mrid
                dto.productAssetModelId = uuid.newUuid()
                dto.lifecycleDateId = uuid.newUuid()
                dto.inUseDateId = uuid.newUuid()
                dto.userId = userId || ''
                dto.userIdentifiedObjectId = uuid.newUuid()

                PROP_FIELDS.forEach(f => {
                    const arr = lvm[f]
                    if ((!arr || arr[i] === undefined) && f !== 'manufacturer') return
                    if (f === 'manufacturer' && (!arr || arr[i] === undefined || String(arr[i]).trim() === '')) {
                        const fromSheet = manufacturerBySheet && rowSheet ? manufacturerBySheet[rowSheet] : ''
                        if (!fromSheet) return
                        dto.properties[f] = fromSheet
                        return
                    }
                    const value = SERIAL_AWARE_PROP_FIELDS.includes(f)
                        ? this.resolveSerialAwareText(arr[i], serial, serialValues)
                        : arr[i]
                    dto.properties[f] = f === 'is_accessory' ? (truthy(value) ? 1 : 0) : value
                })
                dto.properties.serial_no = serial

                dto.calibration = this.resolveNestedForSerial(this._buildNested(lvm, 'cal_', CAL_FIELDS, i, count), 'cal_', serial, serialValues)
                dto.licenses = this.resolveNestedForSerial(this._buildNested(lvm, 'lic_', LIC_FIELDS, i, count), 'lic_', serial, serialValues)
                dto.repairs = this.resolveNestedForSerial(this._buildNested(lvm, 'rep_', REP_FIELDS, i, count), 'rep_', serial, serialValues)
                this.normalizeDtoDates(dto)
                dtos.push(dto)
            })
        }
        return dtos
    },

    normalizeDtoDates(dto) {
        normalizeDateField(dto.properties, 'manufacturer_year')
        if (dto.properties && isYearOnlyDate(dto.properties.in_use_date)) {
            const inUseYear = String(dto.properties.in_use_date).trim()
            if (dto.properties.manufacturer_year && dateYear(dto.properties.manufacturer_year) === inUseYear) {
                dto.properties.in_use_date = dto.properties.manufacturer_year
            } else {
                normalizeDateField(dto.properties, 'in_use_date')
            }
        } else {
            normalizeDateField(dto.properties, 'in_use_date')
        }
        ;(dto.calibration || []).forEach(record => DATE_NESTED_FIELDS.cal_.forEach(field => normalizeDateField(record, field)))
        ;(dto.licenses || []).forEach(record => DATE_NESTED_FIELDS.lic_.forEach(field => normalizeDateField(record, field)))
        ;(dto.repairs || []).forEach(record => DATE_NESTED_FIELDS.rep_.forEach(field => normalizeDateField(record, field)))
    },

    getSheetForIndex(lvm, index) {
        const sheetsByLeaf = lvm.__sheetsByLeaf || {}
        const preferred = ['serial_no', 'name', 'model', 'type', 'manufacturer']
        for (const leaf of preferred) {
            if (sheetsByLeaf[leaf] && sheetsByLeaf[leaf][index]) return sheetsByLeaf[leaf][index]
        }
        const first = Object.keys(sheetsByLeaf).find(key => sheetsByLeaf[key] && sheetsByLeaf[key][index])
        return first ? sheetsByLeaf[first][index] : ''
    },

    splitSerials(value) {
        if (value == null) return []
        const text = String(value).trim()
        if (!text || text === '-') return text ? [text] : []
        const parts = text
            .split(/[;,+/\n\r]+/)
            .map(v => v.trim())
            .filter(Boolean)
        return parts.length > 1 ? Array.from(new Set(parts)) : [text]
    },

    splitSharedList(value) {
        if (value == null) return []
        const text = String(value).trim()
        if (!text) return []
        return text
            .split(/\s*\+\s*|\r?\n/)
            .map(v => v.replace(/^[-•\s]+/, '').trim())
            .filter(Boolean)
    },

    splitRepairReason(value) {
        if (value == null) return []
        const text = String(value).trim()
        if (!text) return []

        const protectedText = text
            .replace(/\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/g, match => match.replace(/\//g, '__DATE_SLASH__'))
            .replace(/\b\d{1,2}\\\d{1,2}(?:\\\d{2,4})?\b/g, match => match.replace(/\\/g, '__DATE_BACKSLASH__'))

        const rawParts = protectedText
            .split(/\r?\n|[;\\/]+/)
            .map(part => part
                .replace(/__DATE_SLASH__/g, '/')
                .replace(/__DATE_BACKSLASH__/g, '\\')
                .trim()
            )
            .filter(Boolean)

        const ascii = (part) => String(part || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D')
        const startsEvent = (part) => /^['"`\s]*(?:[-•*]+\s*|\d+[.)]\s*|[A-Z0-9]+:\s*|(?:bi hong|loi|sua|thay|gui|chuyen|ngay)\b)/i.test(ascii(part))
        const events = []

        rawParts.forEach(part => {
            const cleaned = part.replace(/^['"`\s]*[-•*]+\s*/, '').trim()
            if (!cleaned) return
            if (!events.length || startsEvent(part)) {
                events.push(cleaned)
            } else {
                events[events.length - 1] = `${events[events.length - 1]}\n${cleaned}`
            }
        })

        return events.length ? events : [text]
    },

    splitRepairRecords(records) {
        return (records || []).flatMap(record => {
            if (!record || !record.reason) return [record]
            const reasons = this.splitRepairReason(record.reason)
            if (reasons.length <= 1) return [record]
            return reasons.map(reason => ({
                ...record,
                mrid: uuid.newUuid(),
                reason
            }))
        })
    },

    resolveNestedForSerial(records, prefix, serial, allSerials) {
        if (!records || !records.length) return records
        const serialAwareFields = SERIAL_AWARE_NESTED_FIELDS[prefix] || []
        const sharedListFields = SHARED_LIST_NESTED_FIELDS[prefix] || []

        const resolved = records.flatMap(record => {
            const base = { ...record }
            const hadReason = !!base.reason
            const requiredListField = sharedListFields.find(field => record[field])
            serialAwareFields.forEach(field => {
                if (base[field]) base[field] = this.resolveSerialAwareText(base[field], serial, allSerials)
            })
            if (prefix === 'rep_' && hadReason && !base.reason) return []
            if (requiredListField && !base[requiredListField]) return []

            const listField = sharedListFields.find(field => base[field])
            if (!listField) return [base]

            const items = this.splitSharedList(base[listField])
            if (items.length <= 1) return [base]

            return items.map(item => ({
                ...base,
                mrid: uuid.newUuid(),
                [listField]: item
            }))
        }).filter(record => Object.keys(record).some(key => key !== 'mrid' && record[key] !== '' && record[key] != null))

        return prefix === 'rep_' ? this.splitRepairRecords(resolved) : resolved
    },

    resolveSerialAwareText(value, serial, allSerials) {
        if (value == null || String(value).trim() === '') return value
        if (!serial || !allSerials || allSerials.length <= 1) return value

        const source = String(value)
        const lines = source.split(/\r?\n/).map(v => v.trim()).filter(Boolean)
        if (!lines.length) return source

        const norm = v => String(v || '').trim().toLowerCase()
        const target = norm(serial)
        const serialSet = allSerials.map(norm).filter(Boolean)
        const containsSerials = line => serialSet.filter(s => norm(line).includes(s))

        const blocks = []
        let current = null
        lines.forEach(line => {
            const hits = containsSerials(line)
            if (hits.length) {
                current = { serials: hits, lines: [line] }
                blocks.push(current)
            } else if (current) {
                current.lines.push(line)
            }
        })

        const matchedBlocks = blocks
            .filter(block => block.serials.includes(target))
            .map(block => this.stripSerialPrefix(block.lines.join('\n'), allSerials))
            .filter(Boolean)
        if (matchedBlocks.length) return matchedBlocks.join('\n')
        if (blocks.length) return ''

        const matchedLines = lines
            .filter(line => norm(line).includes(target))
            .map(line => this.stripSerialPrefix(line, allSerials))
            .filter(Boolean)
        return matchedLines.length ? matchedLines.join('\n') : source
    },

    stripSerialPrefix(value, allSerials) {
        const serialPattern = (allSerials || [])
            .filter(Boolean)
            .map(s => String(s).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
            .join('|')
        if (!serialPattern) return value

        return String(value || '')
            .split(/\r?\n/)
            .map(line => line
                .replace(/^[\s'"`•\-]+/, '')
                .replace(new RegExp(`^(?:(?:${serialPattern})\\s*(?:,|;|/|\\+|&|and)?\\s*)+[:：\\-]?\\s*`, 'i'), '')
                .trim()
            )
            .filter(Boolean)
            .join('\n')
    },

    _buildNested(lvm, prefix, fields, index, equipmentCount) {
        const maxLen = fields.reduce((m, f) => Math.max(m, (lvm[prefix + f] || []).length), 0)
        if (!maxLen) return []
        // nhiều thiết bị: record i thuộc thiết bị i; 1 thiết bị: nhận toàn bộ records
        const indices = equipmentCount > 1
            ? (index < maxLen ? [index] : [])
            : Array.from({ length: maxLen }, (_, k) => k)
        return indices
            .map(k => {
                const rec = { mrid: uuid.newUuid() }
                fields.forEach(f => {
                    const arr = lvm[prefix + f]
                    if (arr && arr[k] !== undefined) rec[f] = arr[k]
                })
                return rec
            })
            .filter(rec => Object.keys(rec).length > 1) // bỏ record rỗng (chỉ có mrid)
    },

    // Build entities + check trùng với DB local.
    // Returns null nếu template không có row Testing equipment / file không có data.
    async prepare(codeValueMap, tableData, userId, options = {}) {
        const lvm = this.buildLeafValueMap(codeValueMap, tableData, options.codeSheetMap || {})
        if (!Object.keys(lvm).length) return null
        const entities = this.buildDtos(lvm, userId, options.manufacturerBySheet || {}).map(mapDtoToEntity)
        if (!entities.length) return null
        const existingList = await loadExistingList(userId)
        const { newcomers, conflicts } = splitByDuplicate(entities, existingList)
        return { entities, newcomers, conflicts }
    },

    // Insert thiết bị mới + các thiết bị trùng user chọn overwrite (giữ mrid CÓ SẴN)
    async run(newcomers, overwrites) {
        let ok = 0, fail = 0
        const doInsert = async (entity, oldEntity = null) => {
            const rs = await window.electronAPI[INSERT_API](oldEntity, entity)
            rs && rs.success ? ok++ : fail++
        }
        for (const n of newcomers) {
            try { await doInsert(n.entity) } catch (e) { console.error('TE import item failed:', e); fail++ }
        }
        for (const c of overwrites) {
            try {
                const entity = c.entity
                if (entity.testingEquipment) entity.testingEquipment.mrid = c.existingMrid
                if (entity.asset) entity.asset.mrid = c.existingMrid
                const oldRs = await window.electronAPI.getTestingEquipmentEntityByMrid(c.existingMrid)
                const oldEntity = oldRs && oldRs.success ? oldRs.data : null
                await doInsert(entity, oldEntity)
            } catch (e) { console.error('TE overwrite item failed:', e); fail++ }
        }
        return { ok, fail }
    }
}

export default templateImport
