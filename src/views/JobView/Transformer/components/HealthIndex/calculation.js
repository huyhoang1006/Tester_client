export const HI_WEIGHT_TOTAL = 3.33

const number = value => {
    const result = Number(value)
    return value !== null && value !== undefined && value !== '' && Number.isFinite(result)
        ? result
        : null
}

export const hasAssessmentData = row => (
    number(row && row.average_score) !== null || number(row && row.worst_score) !== null
)

export const normalizeAssessedRows = rows => {
    const assessed = (rows || []).filter(row => (
        number(row && row.source_rpn) > 0 && hasAssessmentData(row)
    ))
    const availableRpn = assessed.reduce((sum, row) => sum + number(row.source_rpn), 0)
    if (!availableRpn) return []

    return assessed.map(row => {
        const rpnProportion = number(row.source_rpn) / availableRpn
        return {
            ...row,
            rpn_proportion: rpnProportion,
            weighting_factor: rpnProportion * HI_WEIGHT_TOTAL
        }
    })
}

export const confidenceLevel = ratio => {
    if (ratio >= 0.9) return 'Very high confidence'
    if (ratio >= 0.8) return 'High confidence'
    if (ratio >= 0.6) return 'Moderate confidence'
    if (ratio >= 0.3) return 'Low confidence'
    return 'Insufficient'
}

export const calculateAssessmentConfidence = (rows, weightingReady) => {
    if (!weightingReady) return {label: 'Not assessed', ratio: null, missing: []}

    const coreRows = (rows || []).filter(row => number(row && row.source_rpn) > 0)
    const totalRpn = coreRows.reduce((sum, row) => sum + number(row.source_rpn), 0)
    const availableRpn = coreRows
        .filter(hasAssessmentData)
        .reduce((sum, row) => sum + number(row.source_rpn), 0)
    const ratio = totalRpn ? availableRpn / totalRpn : 0

    return {
        label: confidenceLevel(ratio),
        ratio,
        missing: coreRows
            .filter(row => !hasAssessmentData(row))
            .map(row => row.core_test_name || row.name)
    }
}
