export const validateTestingEquipmentRows = (rows, rootMrid) => {
    const list = Array.isArray(rows) ? rows : []
    const rowIndex = list.findIndex(item => {
        if (!item) return true
        const mrid = item.mrid == null ? '' : String(item.mrid).trim()
        return !mrid || mrid === rootMrid
    })

    if (rowIndex < 0) return { valid: true, message: '' }
    return {
        valid: false,
        message: `Please select testing equipment for row ${rowIndex + 1}.`
    }
}

export default validateTestingEquipmentRows
