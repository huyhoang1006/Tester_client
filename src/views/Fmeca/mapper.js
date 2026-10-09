import {v4 as uuidv4} from 'uuid'

export const CUSTOM_TEST = 'Custom test'
export const TRANSFORMER_AGE_TEST = 'Transformer age'

export const DEFAULT_TEST_OPTIONS = [
    'DGA main tank',
    'Oil test main tank',
    'Thermal scan',
    'Insulation resistance',
    'Ratio test',
    'DC winding resistance',
    'Winding PF/DF',
    'Bushing PF/DF',
    'Winding capacitance',
    'Bushing C1 capacitance',
    'Short circuit impedance / Leakage reactance',
    'FRSL',
    'SFRA',
    'Moisture content (DRA)',
    'Excitation current',
    'OLTC scan',
    'DGA LTC',
    'Oil test LTC',
    'DGA Bushing',
    TRANSFORMER_AGE_TEST,
    CUSTOM_TEST
]

export const cellValue = cell => {
    if (cell && typeof cell === 'object' && Object.prototype.hasOwnProperty.call(cell, 'formula')) {
        return cell.cached == null ? null : cell.cached
    }
    return cell == null ? null : cell
}

const cellFormula = cell => (
    cell && typeof cell === 'object' && typeof cell.formula === 'string' ? cell.formula : ''
)

const isFilled = value => value !== null && value !== undefined && value !== ''

const numeric = value => {
    if (!isFilled(value)) return 0
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

const score = value => Math.max(1, Math.min(10, Math.round(numeric(value) || 1)))

const rounded = (value, digits) => {
    const factor = 10 ** digits
    return Math.round((value + Number.EPSILON) * factor) / factor
}

const references = (formula, column) => {
    const matches = []
    const pattern = new RegExp(`${column}\\$?(\\d+)`, 'gi')
    let match = pattern.exec(formula || '')
    while (match) {
        matches.push(Number(match[1]))
        match = pattern.exec(formula || '')
    }
    return matches
}

export const mapFmecaRows = table => {
    if (Array.isArray(table)) return table
    if (!table || !Array.isArray(table.rows)) return []

    let level = 0
    return table.rows.slice(1).map((cells, index) => {
        const values = cells.map(cellValue)
        const number = values[0]
        if (isFilled(number)) level = Math.max(0, String(number).split('.').length - 1)
        return {
            excelRow: index + 3,
            no: isFilled(number) ? number : '',
            level: isFilled(number) ? level : level + 1,
            failureMode: values[1],
            sof: values[2],
            pof: values[3],
            conditionIndicator: values[4],
            test: values[5],
            sot: values[6],
            rpn: values[7],
            rpnFormula: cellFormula(cells[7])
        }
    }).filter(row => [row.no, row.failureMode, row.sof, row.pof, row.conditionIndicator, row.test, row.sot, row.rpn].some(isFilled))
}

export const mapWeightingRows = calculate => {
    const weighting = calculate && calculate.weightingFactors
    if (Array.isArray(weighting)) return weighting
    if (!weighting || !Array.isArray(weighting.rows)) return []

    return weighting.rows.slice(1).map((cells, index) => {
        const values = cells.map(cellValue)
        return {
            excelRow: index + 3,
            no: values[0],
            tranformerConditionCriteria: values[1],
            totalRPN: values[2],
            rpnProportion: values[3],
            weightingFactor: values[4],
            totalRPNFormula: cellFormula(cells[2])
        }
    }).filter(row => isFilled(row.tranformerConditionCriteria))
}

const criterionByExcelRow = tableCalculate => {
    const result = new Map()
    mapWeightingRows(tableCalculate).forEach(row => {
        const criterion = String(row.tranformerConditionCriteria || '').trim()
        if (!criterion || criterion.toLowerCase() === 'total' || numeric(row.totalRPN) <= 0) return
        references(row.totalRPNFormula, 'H').forEach(excelRow => {
            const criteria = result.get(excelRow) || []
            if (!criteria.includes(criterion)) criteria.push(criterion)
            result.set(excelRow, criteria)
        })
    })
    return result
}

const normalizeFailure = (failure, fallbackName = 'Failure mode') => ({
    id: failure.id || uuidv4(),
    name: String(failure.name || failure.failureMode || fallbackName).trim(),
    conditionIndicator: String(failure.conditionIndicator || failure.ci || '').trim(),
    test: String(failure.test || '').trim(),
    customTest: String(failure.customTest || '').trim(),
    sof: score(failure.sof),
    pof: score(failure.pof),
    sot: score(failure.sot),
    includeInHi: failure.includeInHi !== false && failure.included !== false
})

const normalizeComponent = component => ({
    id: component.id || uuidv4(),
    name: String(component.name || 'Component').trim(),
    collapsed: Boolean(component.collapsed),
    failureModes: (component.failureModes || component.failures || []).map((failure, index) => (
        normalizeFailure(failure, `Failure mode ${index + 1}`)
    ))
})

export const toEditableFmeca = (tableFmeca, tableCalculate) => {
    if (tableFmeca && Array.isArray(tableFmeca.components)) {
        return {schemaVersion: 2, components: tableFmeca.components.map(normalizeComponent)}
    }

    const criteria = criterionByExcelRow(tableCalculate)
    const components = []
    let current = null
    mapFmecaRows(tableFmeca).forEach(row => {
        const isHeading = isFilled(row.no)
            && ![row.sof, row.pof, row.sot, row.conditionIndicator, row.test].some(isFilled)
        if (isHeading) {
            current = normalizeComponent({name: row.failureMode || `Component ${components.length + 1}`})
            components.push(current)
            return
        }

        if (!current) {
            current = normalizeComponent({name: 'General'})
            components.push(current)
        }
        const rowCriteria = criteria.get(row.excelRow) || []
        const targetCriteria = rowCriteria.length ? rowCriteria : [null]
        targetCriteria.forEach(criterion => {
            current.failureModes.push(normalizeFailure({
                name: row.failureMode || row.conditionIndicator || row.test,
                conditionIndicator: row.conditionIndicator,
                test: criterion || String(row.test || '').trim(),
                sof: row.sof,
                pof: row.pof,
                sot: row.sot,
                includeInHi: Boolean(criterion)
            }, `Failure mode ${current.failureModes.length + 1}`))
        })
    })

    return {schemaVersion: 2, components}
}

export const createEmptyComponent = () => normalizeComponent({name: 'New component'})

export const createEmptyFailureMode = () => normalizeFailure({
    name: 'New failure mode',
    test: DEFAULT_TEST_OPTIONS[0],
    sof: 1,
    pof: 1,
    sot: 1,
    includeInHi: true
})

export const failureRpn = failure => score(failure.sof) * score(failure.pof) * score(failure.sot)

export const calculateWeighting = components => {
    const totals = new Map()
    const sourceComponents = components || []
    sourceComponents.forEach(component => {
        const failureModes = component.failureModes || []
        failureModes.forEach(failure => {
            const test = String(failure.test || '').trim()
            if (!failure.includeInHi || !test || test === CUSTOM_TEST) return
            totals.set(test, (totals.get(test) || 0) + failureRpn(failure))
        })
    })

    const totalRpn = [...totals.values()].reduce((sum, value) => sum + value, 0)
    const rows = [...totals.entries()].map(([test, total]) => ({
        test,
        totalRPN: total,
        rpnProportion: totalRpn ? rounded(total / totalRpn, 4) : 0,
        weightingFactor: totalRpn ? rounded((total / totalRpn) * 3.33, 4) : 0
    })).sort((left, right) => right.weightingFactor - left.weightingFactor)

    return {
        rows,
        totalRpn,
        testsIncluded: rows.length,
        includesTransformerAge: rows.some(row => row.test === TRANSFORMER_AGE_TEST)
    }
}

export const collectTestOptions = records => {
    const options = new Set(DEFAULT_TEST_OPTIONS)
    const sourceRecords = records || []
    sourceRecords.forEach(record => {
        const editable = toEditableFmeca(record.tableFmeca, record.tableCalculate)
        editable.components.forEach(component => component.failureModes.forEach(failure => {
            if (failure.test) options.add(failure.test)
        }))
    })
    return [...options].filter(Boolean)
}

export const validateEditableFmeca = components => {
    for (const component of components || []) {
        if (!String(component.name || '').trim()) return 'Component name is required'
        for (const failure of component.failureModes || []) {
            if (!String(failure.name || '').trim()) return 'Failure mode name is required'
            if (!String(failure.test || '').trim()) return `Select a test for ${failure.name}`
            if (failure.test === CUSTOM_TEST && !String(failure.customTest || '').trim()) {
                return `Enter a custom test name for ${failure.name}`
            }
            if (![failure.sof, failure.pof, failure.sot].every(value => Number(value) >= 1 && Number(value) <= 10)) {
                return `SoF, PoF and SoT must be between 1 and 10 for ${failure.name}`
            }
        }
    }
    return ''
}

export const calculateFmeca = (fmecaRows, weightingRows) => {
    const sourceCells = new Map()
    for (const row of fmecaRows) {
        sourceCells.set(`C${row.excelRow}`, numeric(row.sof))
        sourceCells.set(`D${row.excelRow}`, numeric(row.pof))
        sourceCells.set(`G${row.excelRow}`, numeric(row.sot))
    }

    const calculatedFmeca = fmecaRows.map(row => {
        if (!row.rpnFormula) return {...row}
        const factors = ['C', 'D', 'G'].flatMap(column => (
            references(row.rpnFormula, column).map(excelRow => sourceCells.get(`${column}${excelRow}`) || 0)
        ))
        const rpn = factors.length ? factors.reduce((product, value) => product * value, 1) : 0
        sourceCells.set(`H${row.excelRow}`, rpn)
        return {...row, rpn}
    })

    const detailRows = weightingRows.filter(row => String(row.tranformerConditionCriteria || '').trim().toLowerCase() !== 'total')
    const totals = detailRows.map(row => references(row.totalRPNFormula, 'H')
        .reduce((sum, excelRow) => sum + (sourceCells.get(`H${excelRow}`) || 0), 0))
    const grandTotal = totals.reduce((sum, value) => sum + value, 0)
    let detailIndex = 0
    const calculatedWeighting = weightingRows.map(row => {
        const isTotal = String(row.tranformerConditionCriteria || '').trim().toLowerCase() === 'total'
        if (isTotal) return {...row}
        const totalRPN = totals[detailIndex++]
        const rpnProportion = grandTotal ? rounded(totalRPN / grandTotal, 4) : 0
        return {...row, totalRPN, rpnProportion, weightingFactor: rounded(rpnProportion * 3.33, 4)}
    })

    const totalRow = calculatedWeighting.find(row => (
        String(row.tranformerConditionCriteria || '').trim().toLowerCase() === 'total'
    ))
    if (totalRow) {
        totalRow.totalRPN = grandTotal
        totalRow.rpnProportion = rounded(calculatedWeighting
            .filter(row => row !== totalRow)
            .reduce((sum, row) => sum + numeric(row.rpnProportion), 0), 4)
        totalRow.weightingFactor = rounded(totalRow.rpnProportion * 3.33, 2)
    }

    return {fmecaRows: calculatedFmeca, weightingRows: calculatedWeighting}
}
