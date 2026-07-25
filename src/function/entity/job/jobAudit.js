import { normaliseAuditValue, tryWriteAuditLog } from '../auditLog/index'

const VALUE_GROUPS = [
    { key: 'analogValues', label: 'Analog value', valueKeys: ['value', 'analog'] },
    { key: 'stringMeasurementValues', label: 'String value', valueKeys: ['value'] },
    { key: 'discreteValues', label: 'Discrete value', valueKeys: ['value'] }
]

const SUMMARY_GROUPS = [
    'workTasks',
    'testingEquipment',
    'testDataSet',
    'attachmentTest',
    'testStandard',
    'assessment',
    'assessment_group',
    'assessment_rule',
    'standardCustomized'
]

const getEntityUser = (entity) => {
    const user = entity && entity.user ? entity.user : {}
    return {
        name: user.name || user.user_name || user.username || 'Unknown',
        id: user.user_id || user.id || null
    }
}

const getOldWork = (entity) => entity && entity.oldWork ? entity.oldWork : {}

const getJobId = (entity) => getOldWork(entity).mrid || null

const getJobName = (entity, fallback) => {
    const work = getOldWork(entity)
    return normaliseAuditValue(work.name || work.work_order_number || work.mrid) || fallback || 'Unnamed job'
}

const countValue = (entity, group) => {
    const value = entity && entity[group]
    if (Array.isArray(value)) return value.length
    return value ? 1 : 0
}

const stableCoreValue = (value) => {
    if (value === undefined || value === null) return ''
    if (typeof value !== 'object') return normaliseAuditValue(value)
    const output = {}
    Object.keys(value)
        .filter((key) => key !== 'mrid')
        .sort()
        .forEach((key) => {
            const child = value[key]
            if (typeof child === 'object') {
                output[key] = normaliseAuditValue(JSON.stringify(child))
            } else {
                output[key] = normaliseAuditValue(child)
            }
        })
    return JSON.stringify(output)
}

const fieldLabel = (key) => {
    return key
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .replace(/^./, (char) => char.toUpperCase())
}

const toArray = (entity, key) => {
    const value = entity && entity[key]
    return Array.isArray(value) ? value : []
}

const indexByMrid = (items) => {
    const output = {}
    for (const item of items) {
        if (item && item.mrid) output[item.mrid] = item
    }
    return output
}

const firstText = (item, keys, fallback = '') => {
    for (const key of keys) {
        const value = normaliseAuditValue(item && item[key])
        if (value) return value
    }
    return fallback
}

const getMeasurementDatasetId = (item) => {
    return firstText(item, [
        'procedure_dataset_id',
        'procedure_dataset',
        'procedureDataSet',
        'test_dataset',
        'testDataSet'
    ])
}

const buildJobContext = (entity) => {
    const workTasksById = indexByMrid(toArray(entity, 'workTasks'))
    const testDataSetsById = indexByMrid(toArray(entity, 'testDataSet'))
    return { workTasksById, testDataSetsById }
}

const getTestName = (item, context) => {
    const datasetId = getMeasurementDatasetId(item)
    const dataset = context.testDataSetsById[datasetId] || {}
    const workTask = context.workTasksById[dataset.work_task] || {}
    return firstText(workTask, ['name', 'alias_name', 'description', 'task_kind', 'mrid']) ||
        firstText(dataset, ['name', 'alias_name', 'description', 'mrid'], 'Unknown test')
}

const getMeasurementName = (item, groupLabel) => {
    return firstText(item, [
        'name',
        'alias_name',
        'description',
        'path_name',
        'measurement_name',
        'analog',
        'mrid'
    ], groupLabel)
}

const buildRowLookup = (items) => {
    const counters = {}
    const rows = {}
    items.forEach((item, index) => {
        const datasetId = getMeasurementDatasetId(item) || 'unknown'
        counters[datasetId] = (counters[datasetId] || 0) + 1
        if (item && item.mrid) rows[item.mrid] = counters[datasetId]
        if (item && !item.mrid) rows[`index:${index}`] = counters[datasetId]
    })
    return rows
}

const formatMeasurementField = (item, context, groupLabel, rowLookup, index, valueKey) => {
    const row = rowLookup[item && item.mrid ? item.mrid : `index:${index}`] || (index + 1)
    const testName = getTestName(item, context)
    const measurementName = getMeasurementName(item, groupLabel)
    const keyLabel = valueKey === 'value' ? 'value' : fieldLabel(valueKey)
    return `${testName} - row ${row} - ${measurementName} ${keyLabel}`
}

const getSummaryFields = (entity) => {
    const fields = {
        'Job': stableCoreValue(getOldWork(entity))
    }
    for (const group of SUMMARY_GROUPS) {
        fields[`${fieldLabel(group)} count`] = String(countValue(entity, group))
    }
    return fields
}

const getSummaryChanges = (beforeEntity, afterEntity) => {
    const before = getSummaryFields(beforeEntity)
    const after = getSummaryFields(afterEntity)
    return Object.keys(after)
        .map((field) => ({
            field,
            from: normaliseAuditValue(before[field]),
            to: normaliseAuditValue(after[field])
        }))
        .filter((change) => change.from !== change.to)
}

const getValueChanges = (beforeEntity, afterEntity) => {
    const changes = []
    const afterContext = buildJobContext(afterEntity)

    for (const group of VALUE_GROUPS) {
        const beforeItems = toArray(beforeEntity, group.key)
        const afterItems = toArray(afterEntity, group.key)
        const beforeById = indexByMrid(beforeItems)
        const afterById = indexByMrid(afterItems)
        const rowLookup = buildRowLookup(afterItems.length ? afterItems : beforeItems)

        afterItems.forEach((item, index) => {
            const oldItem = item && item.mrid ? beforeById[item.mrid] : beforeItems[index]
            if (!oldItem) {
                changes.push({
                    field: formatMeasurementField(item, afterContext, group.label, rowLookup, index, 'value'),
                    from: '',
                    to: normaliseAuditValue(item && item.value)
                })
                return
            }
            group.valueKeys.forEach((key) => {
                const from = normaliseAuditValue(oldItem && oldItem[key])
                const to = normaliseAuditValue(item && item[key])
                if (from !== to) {
                    changes.push({
                        field: formatMeasurementField(item, afterContext, group.label, rowLookup, index, key),
                        from,
                        to
                    })
                }
            })
        })

        beforeItems.forEach((item, index) => {
            if (item && item.mrid && afterById[item.mrid]) return
            if (!item || !item.mrid) return
            changes.push({
                field: formatMeasurementField(item, buildJobContext(beforeEntity), group.label, rowLookup, index, 'value'),
                from: normaliseAuditValue(item.value),
                to: ''
            })
        })
    }

    return changes
}

const getChanges = (beforeEntity, afterEntity) => {
    return [
        ...getSummaryChanges(beforeEntity, afterEntity),
        ...getValueChanges(beforeEntity, afterEntity)
    ]
        .slice(0, 60)
}

export const writeJobSaveAuditLog = async (objectType, oldEntity, entity) => {
    const isUpdate = !!getJobId(oldEntity)
    const changes = isUpdate ? getChanges(oldEntity, entity) : []
    const result = await tryWriteAuditLog({
        objectType,
        objectId: getJobId(entity),
        objectName: getJobName(entity, objectType),
        action: isUpdate ? 'UPDATE' : 'INSERT',
        changes,
        user: getEntityUser(entity)
    })
    return { ...result, changed: isUpdate ? changes.length > 0 : true }
}

export const writeJobDeleteAuditLog = async (objectType, entity) => {
    await tryWriteAuditLog({
        objectType,
        objectId: getJobId(entity),
        objectName: getJobName(entity, objectType),
        action: 'DELETE',
        user: getEntityUser(entity)
    })
}
