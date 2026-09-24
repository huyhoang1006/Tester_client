export const cellValue = (cell) => {
    if (cell && typeof cell === 'object' && Object.prototype.hasOwnProperty.call(cell, 'formula')) {
        return cell.cached == null ? null : cell.cached
    }
    return cell == null ? null : cell
}

const cellFormula = (cell) => (
    cell && typeof cell === 'object' && typeof cell.formula === 'string' ? cell.formula : ''
)

const isFilled = (value) => value !== null && value !== undefined && value !== ''

export const mapFmecaRows = (table) => {
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

export const mapWeightingRows = (calculate) => {
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

const numeric = (value) => {
    if (!isFilled(value)) return 0
    const number = Number(value)
    return Number.isFinite(number) ? number : 0
}

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

export const calculateFmeca = (fmecaRows, weightingRows) => {
    const sourceCells = new Map()
    for (const row of fmecaRows) {
        sourceCells.set(`C${row.excelRow}`, numeric(row.sof))
        sourceCells.set(`D${row.excelRow}`, numeric(row.pof))
        sourceCells.set(`G${row.excelRow}`, numeric(row.sot))
    }

    const calculatedFmeca = fmecaRows.map(row => {
        if (!row.rpnFormula) return { ...row }
        const factors = ['C', 'D', 'G'].flatMap(column => (
            references(row.rpnFormula, column).map(excelRow => sourceCells.get(`${column}${excelRow}`) || 0)
        ))
        const rpn = factors.length ? factors.reduce((product, value) => product * value, 1) : 0
        sourceCells.set(`H${row.excelRow}`, rpn)
        return { ...row, rpn }
    })

    const detailRows = weightingRows.filter(row => String(row.tranformerConditionCriteria || '').trim().toLowerCase() !== 'total')
    const totals = detailRows.map(row => (
        references(row.totalRPNFormula, 'H')
            .reduce((sum, excelRow) => sum + (sourceCells.get(`H${excelRow}`) || 0), 0)
    ))
    const grandTotal = totals.reduce((sum, value) => sum + value, 0)
    let detailIndex = 0
    const calculatedWeighting = weightingRows.map(row => {
        const isTotal = String(row.tranformerConditionCriteria || '').trim().toLowerCase() === 'total'
        if (isTotal) return { ...row }
        const totalRPN = totals[detailIndex++]
        const rpnProportion = grandTotal ? rounded(totalRPN / grandTotal, 4) : 0
        return {
            ...row,
            totalRPN,
            rpnProportion,
            weightingFactor: rounded(rpnProportion * 3.33, 4)
        }
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

    return { fmecaRows: calculatedFmeca, weightingRows: calculatedWeighting }
}
