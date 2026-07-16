/* eslint-disable */
import uuid from '@/utils/uuid'
import templateImport, { TE_CAT_KEY } from './templateImport'
import { mapDtoToEntity } from '@/views/Mapping/TestingEquipment'
import { splitByDuplicate, loadExistingList, norm, entityKeyFields } from './duplicateCheck'

const rowHasData = (row) => (row || []).some(value => String(value == null ? '' : value).trim() !== '')

const DATE_FIELDS = new Set([
    'manufacturer_year',
    'in_use_date',
    'cal_calibration_date',
    'cal_due_date',
    'lic_activation_date',
    'lic_expiry_date',
    'rep_created_date_time'
])

const NUMBER_FIELDS = new Set([
    'cal_interval_months',
    'rep_cost'
])

const pad2 = (value) => String(value).padStart(2, '0')

const parseDateByFormat = (value, format) => {
    const text = String(value == null ? '' : value).trim()
    if (!text || !format) return text
    const tokens = []
    const escapeRegex = (part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const pattern = format.split(/(yyyy|MM|dd|HH|mm|ss)/g).map(part => {
        if (!part) return ''
        if (/^(yyyy|MM|dd|HH|mm|ss)$/.test(part)) {
            tokens.push(part)
            return '(\\d{1,4})'
        }
        return escapeRegex(part)
    }).join('')
    const match = text.match(new RegExp(`^${pattern}$`))
    if (!match) return text
    const parts = {}
    tokens.forEach((token, index) => { parts[token] = match[index + 1] })
    const year = parts.yyyy
    const month = parts.MM
    const day = parts.dd
    if (!year || !month || !day) return text
    const date = `${year}-${pad2(month)}-${pad2(day)}`
    if (parts.HH != null || parts.mm != null || parts.ss != null) {
        return `${date} ${pad2(parts.HH || 0)}:${pad2(parts.mm || 0)}:${pad2(parts.ss || 0)}`
    }
    return date
}

const normalizeNumberByFormat = (value, options = {}) => {
    let text = String(value == null ? '' : value).trim()
    if (!text) return text
    const thousands = options.thousandsSeparator == null ? ',' : options.thousandsSeparator
    const decimal = options.decimalSeparator || '.'
    if (thousands) {
        const escaped = thousands.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        text = text.replace(new RegExp(escaped, 'g'), '')
    }
    if (decimal && decimal !== '.') text = text.replace(decimal, '.')
    return /^-?\d+(\.\d+)?$/.test(text) ? text : value
}

const normalizeMappedValue = (value, fieldValue, options = {}) => {
    if (DATE_FIELDS.has(fieldValue)) {
        const format = fieldValue === 'rep_created_date_time'
            ? (options.datetimeFormat || options.dateFormat)
            : options.dateFormat
        return parseDateByFormat(value, format)
    }
    if (NUMBER_FIELDS.has(fieldValue)) return normalizeNumberByFormat(value, options)
    return value
}

const compactObjectValues = (obj, ignoreKeys = []) => Object.keys(obj || {})
    .filter(key => !ignoreKeys.includes(key))
    .map(key => obj[key])
    .map(value => String(value == null ? '' : value).trim())
    .join('|')
    .toLowerCase()

const appendDistinct = (target, source, ownerMrid, ownerField) => {
    const rows = target || []
    const seen = new Set(rows.map(row => compactObjectValues(row, ['mrid'])))
    ;(source || []).forEach(item => {
        const key = compactObjectValues(item, ['mrid'])
        if (!key || seen.has(key)) return
        const next = { ...item, mrid: item.mrid || uuid.newUuid() }
        if (ownerField) next[ownerField] = ownerMrid
        rows.push(next)
        seen.add(key)
    })
    return rows
}

const fillBlank = (target, source, fields) => {
    fields.forEach(field => {
        if ((target[field] == null || target[field] === '') && source[field] != null && source[field] !== '') {
            target[field] = source[field]
        }
    })
}

const mergeEntityInto = (target, source) => {
    const mrid = (target.testingEquipment && target.testingEquipment.mrid) || (target.asset && target.asset.mrid)
    if (target.asset && source.asset) {
        fillBlank(target.asset, source.asset, ['name', 'description', 'serial_number', 'type', 'country_of_origin', 'in_use_state'])
    }
    if (target.productAssetModel && source.productAssetModel) {
        fillBlank(target.productAssetModel, source.productAssetModel, ['name', 'model_number', 'manufacturer'])
    }
    if (target.lifecycleDate && source.lifecycleDate) {
        fillBlank(target.lifecycleDate, source.lifecycleDate, ['manufactured_date'])
    }
    if (target.inUseDate && source.inUseDate) {
        fillBlank(target.inUseDate, source.inUseDate, ['in_use_date'])
    }
    if (target.testingEquipment && source.testingEquipment) {
        fillBlank(target.testingEquipment, source.testingEquipment, ['asset_tag'])
    }

    target.softwareLicenses = appendDistinct(target.softwareLicenses, source.softwareLicenses)
    target.calibrations = appendDistinct(target.calibrations, source.calibrations, mrid, 'testing_equipment')
    target.repairs = appendDistinct(target.repairs, source.repairs, mrid, 'asset')

    const hasInProgressRepair = (target.repairs || []).some(record => record && record.severity === 'InProgress')
    if (hasInProgressRepair && target.asset && (!target.asset.in_use_state || target.asset.in_use_state === 'Available')) {
        target.asset.in_use_state = 'UnderRepair'
    }
}

export const mergeIncomingEntities = (entities) => {
    const grouped = []
    const indexByKey = new Map()
    ;(entities || []).forEach(entity => {
        const fields = entityKeyFields(entity)
        const serial = norm(fields.serial)
        if (!serial) {
            grouped.push(entity)
            return
        }
        const key = [fields.manufacturer, fields.serial, fields.type].map(norm).join('|')
        if (!indexByKey.has(key)) {
            indexByKey.set(key, grouped.length)
            grouped.push(entity)
            return
        }
        mergeEntityInto(grouped[indexByKey.get(key)], entity)
    })
    return grouped
}

export const prepareColumnMappingImport = async ({ rows, mappings, sheetName, userId, formatOptions = {} }) => {
    const dataRows = (rows || []).filter(rowHasData)
    const selectedMappings = (mappings || []).filter(m => m && m.field && m.field.featureLevels && m.field.featureLevels.length)
    if (!dataRows.length || !selectedMappings.length) return null

    const codeValueMap = {}
    const codeSheetMap = {}
    const tableData = selectedMappings.map(mapping => {
        codeValueMap[mapping.key] = dataRows.map(row => normalizeMappedValue(
            row[mapping.index] != null ? row[mapping.index] : '',
            mapping.field.value,
            formatOptions
        ))
        codeSheetMap[mapping.key] = dataRows.map(() => sheetName || '')
        return {
            code: mapping.key,
            category: TE_CAT_KEY,
            featureLevels: mapping.field.featureLevels.map(key => ({ key }))
        }
    })

    const lvm = templateImport.buildLeafValueMap(codeValueMap, tableData, codeSheetMap)
    if (!Object.keys(lvm).length) return null

    const dtos = templateImport.buildDtos(lvm, userId, {})
    if (!dtos.length) return null

    const entities = mergeIncomingEntities(dtos.map(mapDtoToEntity))
    const existingList = await loadExistingList(userId)
    const { newcomers, conflicts } = splitByDuplicate(entities, existingList)
    return { entities, newcomers, conflicts }
}

export default {
    prepareColumnMappingImport,
    mergeIncomingEntities
}
