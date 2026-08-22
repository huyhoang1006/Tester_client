const parseMaybeJson = (value) => {
    if (typeof value !== 'string') return value || {}
    try {
        return JSON.parse(value) || {}
    } catch (e) {
        return {}
    }
}

const unwrapValue = (value) => {
    if (value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')) {
        return value.value
    }
    return value
}

const normalizeFormula = (formula) => {
    const raw = unwrapValue(formula)
    const normalized = String(raw === null || raw === undefined ? '' : raw)
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '')

    if (normalized === '3' || normalized === 'ONE_TO_3' || normalized === '1/3') {
        return { code: '3', label: '1 / 3', multiplier: 1 / 3 }
    }
    if (normalized === '3SQRT' || normalized === 'ONE_TO_SQRT3' || normalized.indexOf('√3') >= 0 || normalized.indexOf('SQRT3') >= 0) {
        return { code: '3sqrt', label: '1 / √3', multiplier: 1 / Math.sqrt(3) }
    }
    if (normalized === '1' || normalized === 'ONE_TO_ONE' || normalized === '1/1') {
        return { code: '1', label: '1 / 1', multiplier: 1 }
    }
    return { code: '', label: '', multiplier: NaN }
}

const normalizeUnit = (unit, fallback) => {
    const raw = String(unit || fallback || '').replace('|', '').replace('_', '')
    if (/^kv$/i.test(raw)) return 'kV'
    if (/^mv$/i.test(raw)) return 'MV'
    if (/^v$/i.test(raw)) return 'V'
    return fallback || raw
}

const findLinkedVoltage = (assetData, mrid) => {
    const values = Array.isArray(assetData && assetData.voltage) ? assetData.voltage : []
    return values.find(function(item) { return item && item.mrid === mrid }) || null
}

const readVoltage = (assetData, source, fallbackUnit) => {
    if (source && typeof source === 'object') {
        return {
            value: unwrapValue(source),
            unit: normalizeUnit(source.unit, fallbackUnit)
        }
    }

    const linked = findLinkedVoltage(assetData, source)
    return {
        value: linked ? linked.value : '',
        unit: normalizeUnit(linked ? (linked.multiplier ? linked.multiplier + linked.unit : linked.unit) : '', fallbackUnit)
    }
}

const readPrimary = (assetData) => {
    const ratings = parseMaybeJson(assetData && assetData.ratings)
    const info = parseMaybeJson(assetData && assetData.OldPotentialTransformerInfo)
    const voltage = readVoltage(assetData, ratings.rated_voltage || info.rated_voltage, 'kV')
    return {
        value: voltage.value,
        unit: voltage.unit,
        formula: normalizeFormula(ratings.upr || info.upr_formula)
    }
}

const readSecondaryRows = (assetData) => {
    const config = parseMaybeJson(assetData && assetData.vt_Configuration)
    const dtoRows = Array.isArray(config.dataVT) ? config.dataVT : []
    const entityRows = Array.isArray(assetData && assetData.potentialTransformerTable)
        ? assetData.potentialTransformerTable
        : []

    return (dtoRows.length ? dtoRows : entityRows).map(function(item) {
        const row = item && item.table ? item.table : item || {}
        const voltage = readVoltage(assetData, row.usr_rated_voltage, 'V')
        return {
            name: row.name || '',
            value: voltage.value,
            unit: voltage.unit,
            formula: normalizeFormula(row.usr_formula)
        }
    })
}

export const readVTRatioProfile = (assetData) => {
    return {
        primary: readPrimary(assetData || {}),
        secondary: readSecondaryRows(assetData || {})
    }
}

export const voltageToVolts = (value, unit) => {
    const numeric = parseFloat(value)
    if (!Number.isFinite(numeric)) return NaN
    const normalized = normalizeUnit(unit, 'V')
    if (normalized === 'MV') return numeric * 1000000
    if (normalized === 'kV') return numeric * 1000
    return numeric
}

export const effectiveVoltage = (voltage) => {
    if (!voltage || !voltage.formula || !Number.isFinite(voltage.formula.multiplier)) return NaN
    return voltageToVolts(voltage.value, voltage.unit) * voltage.formula.multiplier
}

export const formatRatedVoltage = (voltage) => {
    if (!voltage || voltage.value === '' || voltage.value === null || voltage.value === undefined) return ''
    const factor = voltage.formula && voltage.formula.label ? voltage.formula.label.replace('1 / ', '') : ''
    return factor ? String(voltage.value) + ' / ' + factor : String(voltage.value)
}
