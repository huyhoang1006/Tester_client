import {
    RESISTANCE_ABSOLUTE,
    RESISTANCE_SIGNED,
    EXCITING_CURRENT,
    DF_CAP,
    CAP_ONLY,
    SHORT_CIRCUIT
} from '@/config/reference-value-mappings'

const isBlank = value => value === null || value === undefined || String(value).trim() === ''

const findReferenceCell = (row, code) => Object.values((row && row.cells) || {})
    .find(cell => cell && cell.aliasName === code)

const valuesMatchExactly = (currentCell, referenceCell) => {
    if (!currentCell || !referenceCell || isBlank(currentCell.value) || isBlank(referenceCell.value)) return false

    const currentValue = currentCell.value
    const referenceValue = referenceCell.value
    const numericKey = (currentCell.type === 'analog' || referenceCell.kind === 'analog')
        && Number.isFinite(Number(currentValue))
        && Number.isFinite(Number(referenceValue))

    return numericKey
        ? Number(currentValue) === Number(referenceValue)
        : String(currentValue) === String(referenceValue)
}

const rowsMatchExactly = (currentRow, referenceRow, keys) => keys.every(code => {
    return valuesMatchExactly(currentRow && currentRow[code], findReferenceCell(referenceRow, code))
})

const columnMap = columns => (columns || []).reduce((result, column) => {
    if (column && column.code) result[column.code] = column
    return result
}, {})

const newCell = column => ({
    mrid: '',
    value: '',
    unit: column.unit || '',
    type: column.type,
    measurement_id: column.mrid
})

const ensureCell = (row, code, columnsByCode, reactiveSet) => {
    if (row[code]) return row[code]
    const column = columnsByCode[code]
    if (!column) return null
    const cell = newCell(column)
    if (reactiveSet) reactiveSet(row, code, cell)
    else row[code] = cell
    return cell
}

const numericValue = cell => {
    if (!cell || isBlank(cell.value)) return null
    const value = Number(cell.value)
    return Number.isFinite(value) ? value : null
}

const rounded = value => {
    if (!Number.isFinite(value)) return ''
    return String(Math.round(value * 10000) / 10000)
}

const fixed = value => Number.isFinite(value) ? value.toFixed(4) : ''

const setCalculated = (row, code, value, columnsByCode, reactiveSet) => {
    const cell = ensureCell(row, code, columnsByCode, reactiveSet)
    if (cell) cell.value = value
}

const recalculateRow = (row, calculation, columnsByCode, reactiveSet) => {
    if (calculation === RESISTANCE_ABSOLUTE) {
        const measured = numericValue(row.r_meas)
        const reference = numericValue(row.r_ref)
        const value = measured !== null && reference !== null && reference !== 0
            ? rounded(Math.abs(100 * (measured - reference) / reference))
            : ''
        setCalculated(row, 'dev_r_ref', value, columnsByCode, reactiveSet)
        return
    }

    if (calculation === RESISTANCE_SIGNED) {
        const measured = numericValue(row.r_meas)
        const reference = numericValue(row.r_ref)
        const value = measured !== null && reference !== null && reference !== 0
            ? fixed(100 * (measured - reference) / reference)
            : ''
        setCalculated(row, 'r_dev', value, columnsByCode, reactiveSet)
        return
    }

    if (calculation === EXCITING_CURRENT) {
        const measured = numericValue(row.i_out)
        const reference = numericValue(row.i_ref)
        const value = measured !== null && reference !== null && reference !== 0
            ? rounded(Math.abs(100 * (measured - reference) / reference))
            : ''
        setCalculated(row, 'i_dev', value, columnsByCode, reactiveSet)
        return
    }

    if (calculation === DF_CAP) {
        const dfMeasured = numericValue(row.df_meas)
        const dfReference = numericValue(row.df_ref)
        const capacitanceMeasured = numericValue(row.c_meas)
        const capacitanceReference = numericValue(row.c_ref)
        const dfChange = dfMeasured !== null && dfReference !== null
            ? rounded(Math.abs(dfMeasured - dfReference))
            : ''
        const deltaC = capacitanceMeasured !== null && capacitanceReference !== null && capacitanceReference !== 0
            ? rounded(Math.abs(100 * (capacitanceMeasured - capacitanceReference) / capacitanceReference))
            : ''
        setCalculated(row, 'df_change', dfChange, columnsByCode, reactiveSet)
        setCalculated(row, 'delta_c_percent', deltaC, columnsByCode, reactiveSet)
        return
    }

    if (calculation === CAP_ONLY) {
        const measured = numericValue(row.c_meas)
        const reference = numericValue(row.c_ref)
        const value = measured !== null && reference !== null && reference !== 0
            ? fixed(Math.abs(100 * (measured - reference) / reference))
            : ''
        setCalculated(row, 'delta_c_percent', value, columnsByCode, reactiveSet)
        return
    }

    if (calculation === SHORT_CIRCUIT) {
        const calculated = numericValue(row.uk_cal)
        const reference = numericValue(row.uk_ref)
        const value = calculated !== null && reference !== null && reference !== 0
            ? rounded(Math.abs(100 * (calculated - reference) / reference))
            : ''
        setCalculated(row, 'uk_dev', value, columnsByCode, reactiveSet)
    }
}

export const prepareReferenceValueApplication = ({ currentTable, referenceSnapshot, mapping }) => {
    const operations = []
    const rowsToRecalculate = []
    let matchedCount = 0
    let unmatchedCount = 0
    let hasExistingValues = false

    for (const tableName of Object.keys(currentTable || {})) {
        const currentRows = currentTable[tableName]
        if (!Array.isArray(currentRows)) continue
        const referenceTable = ((referenceSnapshot && referenceSnapshot.tables) || [])
            .find(table => table.title === tableName)
        const availableReferenceRows = ((referenceTable && referenceTable.rows) || [])
            .map(row => ({ row, used: false }))

        for (const currentRow of currentRows) {
            const match = availableReferenceRows.find(candidate => {
                return !candidate.used && rowsMatchExactly(currentRow, candidate.row, mapping.keys)
            })

            if (!match) {
                unmatchedCount += 1
                continue
            }

            match.used = true
            const rowOperations = mapping.fields.reduce((result, field) => {
                const sourceCell = findReferenceCell(match.row, field.source)
                if (sourceCell && !isBlank(sourceCell.value)) {
                    result.push({ row: currentRow, target: field.target, value: sourceCell.value })
                }
                return result
            }, [])

            if (!rowOperations.length) {
                unmatchedCount += 1
                continue
            }

            if (rowOperations.some(operation => {
                return currentRow[operation.target] && !isBlank(currentRow[operation.target].value)
            })) hasExistingValues = true

            operations.push(...rowOperations)
            rowsToRecalculate.push(currentRow)
            matchedCount += 1
        }
    }

    return { operations, rowsToRecalculate, matchedCount, unmatchedCount, hasExistingValues }
}

export const applyReferenceValuePlan = ({ plan, mapping, columns, reactiveSet }) => {
    const columnsByCode = columnMap(columns)
    for (const operation of plan.operations) {
        const targetCell = ensureCell(operation.row, operation.target, columnsByCode, reactiveSet)
        if (targetCell) targetCell.value = operation.value
    }
    for (const row of plan.rowsToRecalculate) {
        recalculateRow(row, mapping.calculation, columnsByCode, reactiveSet)
    }
}

export default {
    prepareReferenceValueApplication,
    applyReferenceValuePlan
}
