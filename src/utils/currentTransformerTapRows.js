const PLACEHOLDER_FIELDS = new Set(['id', 'mrid', 'name', 'type', 'unit', 'core_index', 'isShow'])

const hasEnteredValue = (value, key = '') => {
    if (PLACEHOLDER_FIELDS.has(key) || value == null || value === false) return false
    if (typeof value === 'string') return value.trim() !== '' && value !== 'chooseApp'
    if (typeof value === 'number') return Number.isFinite(value)
    if (Array.isArray(value)) return value.some(item => hasEnteredValue(item))
    if (typeof value === 'object') {
        return Object.entries(value).some(([field, item]) => hasEnteredValue(item, field))
    }
    return value === true
}

export const prepareCurrentTransformerTapRows = (cores = []) => {
    const names = new Set()
    const prepareTap = (tap, coreIndex, kind, rowIndex, fullTapKey = '') => {
        if (!tap) return null
        const name = String(tap.table?.name || '').trim()
        if (!name && !hasEnteredValue(tap)) return null
        if (!name) throw new Error(`Core ${coreIndex + 1}, ${kind} ${rowIndex + 1}: tap name is required.`)

        const key = name.toUpperCase()
        if (names.has(key)) {
            if (kind === 'Main tap' && key === fullTapKey && !hasEnteredValue(tap)) return null
            throw new Error(`Tap name "${name}" is used more than once.`)
        }
        names.add(key)
        return { ...tap, table: { ...tap.table, name } }
    }

    return cores.map((core, coreIndex) => {
        const fullTap = prepareTap(core.fullTap, coreIndex, 'Full tap', 0)
        const fullTapKey = fullTap?.table.name.toUpperCase() || ''
        return {
            ...core,
            fullTap,
            mainTap: {
                ...core.mainTap,
                data: (core.mainTap?.data || [])
                    .map((tap, index) => prepareTap(tap, coreIndex, 'Main tap', index, fullTapKey))
                    .filter(Boolean),
            },
            interTap: {
                ...core.interTap,
                data: (core.interTap?.data || [])
                    .map((tap, index) => prepareTap(tap, coreIndex, 'Inter tap', index))
                    .filter(Boolean),
            },
        }
    })
}
