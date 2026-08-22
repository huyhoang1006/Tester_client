/* eslint-disable */

const text = value => value === null || value === undefined ? '' : String(value).trim()
const tapKey = value => text(value).replace(/\s+/g, '').toUpperCase()

const displayNumber = value => {
    const raw = text(value)
    if (!raw) return ''
    const number = Number(raw)
    return Number.isFinite(number) ? String(number) : raw
}

export const formatCtTapRatio = (ipn, isn) => {
    const primary = displayNumber(ipn)
    const secondary = displayNumber(isn)
    return primary && secondary ? `${primary}:${secondary}` : ''
}

const currentValue = (asset, reference) => {
    if (reference && typeof reference === 'object' && Object.prototype.hasOwnProperty.call(reference, 'value')) {
        return reference.value
    }
    const currents = Array.isArray(asset && asset.currentFlow) ? asset.currentFlow : []
    const current = currents.find(item => item && item.mrid === reference)
    return current ? current.value : ''
}

const dtoTapTables = asset => {
    const cores = asset && asset.ctConfiguration && Array.isArray(asset.ctConfiguration.dataCT)
        ? asset.ctConfiguration.dataCT
        : []
    const tables = []
    cores.forEach(core => {
        if (core && core.fullTap && core.fullTap.table) tables.push(core.fullTap.table)
        const main = core && core.mainTap && Array.isArray(core.mainTap.data) ? core.mainTap.data : []
        const inter = core && core.interTap && Array.isArray(core.interTap.data) ? core.interTap.data : []
        main.forEach(item => { if (item && item.table) tables.push(item.table) })
        inter.forEach(item => { if (item && item.table) tables.push(item.table) })
    })
    return tables
}

/** Resolve the nominal current pair of one CT tap from either Entity or DTO data. */
export const getCtTapCurrents = (asset, tapName) => {
    const name = tapKey(tapName)
    if (!name) return { ipn: '', isn: '' }

    const entityTaps = Array.isArray(asset && asset.CtTapInfo) ? asset.CtTapInfo : []
    const entityTap = entityTaps.find(tap => tapKey(tap && tap.tap_name) === name)
    if (entityTap) {
        return {
            ipn: currentValue(asset, entityTap.ipn),
            isn: currentValue(asset, entityTap.isn),
        }
    }

    const dtoTap = dtoTapTables(asset).find(table => tapKey(table && table.name) === name)
    return dtoTap ? {
        ipn: dtoTap.ipn && dtoTap.ipn.value,
        isn: dtoTap.isn && dtoTap.isn.value,
    } : { ipn: '', isn: '' }
}

export const getCtTapRatio = (asset, tapName) => {
    const currents = getCtTapCurrents(asset, tapName)
    return formatCtTapRatio(currents.ipn, currents.isn)
}

export default { formatCtTapRatio, getCtTapCurrents, getCtTapRatio }
