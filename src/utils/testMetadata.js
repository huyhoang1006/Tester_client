const valueOrFallback = (value, fallback) => {
    return value !== null && value !== undefined ? value : (fallback || '')
}

export const buildTestMetadata = (workTask = {}, jobProperties = {}) => ({
    name: valueOrFallback(workTask.test_name, workTask.name),
    type: valueOrFallback(workTask.type, jobProperties.type),
    testing_date: valueOrFallback(workTask.testing_date, jobProperties.execution_date),
    tested_by: valueOrFallback(workTask.tested_by, jobProperties.tested_by),
    approved_by: valueOrFallback(workTask.approved_by, jobProperties.approved_by),
    approved_date: valueOrFallback(workTask.approved_date, jobProperties.approval_date),
    reference_standard: valueOrFallback(workTask.reference_standard, jobProperties.ref_standard)
})

export const applyTestMetadataToWorkTask = (workTask, test = {}, jobProperties = {}) => {
    const metadata = (test.testCondition && test.testCondition.metadata) || {}
    const fallback = {
        name: test.name,
        type: jobProperties.type,
        testing_date: jobProperties.execution_date,
        tested_by: jobProperties.tested_by,
        approved_by: jobProperties.approved_by,
        approved_date: jobProperties.approval_date,
        reference_standard: jobProperties.ref_standard
    }

    workTask.test_name = valueOrFallback(metadata.name, fallback.name)
    workTask.type = valueOrFallback(metadata.type, fallback.type)
    workTask.testing_date = valueOrFallback(metadata.testing_date, fallback.testing_date)
    workTask.tested_by = valueOrFallback(metadata.tested_by, fallback.tested_by)
    workTask.approved_by = valueOrFallback(metadata.approved_by, fallback.approved_by)
    workTask.approved_date = valueOrFallback(metadata.approved_date, fallback.approved_date)
    workTask.reference_standard = valueOrFallback(metadata.reference_standard, fallback.reference_standard)
    workTask.name = workTask.test_name || test.name || null

    return workTask
}
