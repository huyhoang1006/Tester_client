const isImportValue = value => {
    if (value === null || value === undefined || value === '') return false
    if (typeof value === 'number') return Number.isFinite(value)
    return String(value).trim() !== '' && String(value).trim() !== 'NaN'
}

/**
 * Merge a sparse PTM assessment object into the existing Circuit Breaker DTO.
 * PTM carries no client MRIDs, so this function updates only cell values and
 * deliberately leaves every database identity and unsupported field intact.
 */
export const applyPtmTimingAssessment = (assessmentLimits, ptmAssessment) => {
    const appliedPaths = []
    if (!assessmentLimits || !ptmAssessment) {
        return { appliedCount: 0, appliedPaths }
    }

    if (isImportValue(ptmAssessment.limits)) {
        assessmentLimits.limits = String(ptmAssessment.limits)
    }

    const merge = (target, source, path) => {
        if (!target || !source || typeof source !== 'object') return

        Object.keys(source).forEach(key => {
            if (key === 'active' || key === 'limits') return
            if (!Object.prototype.hasOwnProperty.call(target, key)) return

            const sourceValue = source[key]
            const targetValue = target[key]
            const nextPath = path.concat(key)

            if (sourceValue && typeof sourceValue === 'object') {
                merge(targetValue, sourceValue, nextPath)
                return
            }
            if (!isImportValue(sourceValue)) return

            if (targetValue && typeof targetValue === 'object' &&
                Object.prototype.hasOwnProperty.call(targetValue, 'value')) {
                targetValue.value = String(sourceValue)
                appliedPaths.push(nextPath.join('.'))
            }
        })
    }

    merge(assessmentLimits, ptmAssessment, [])
    return { appliedCount: appliedPaths.length, appliedPaths }
}

export default { applyPtmTimingAssessment }
