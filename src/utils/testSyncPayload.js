import { toServerId, stripServerIdsDeep } from '@/utils/serverId'
import { parseTestDate } from '@/views/TreeNode/Common/Fetch/testDate'

export const sameTestId = (left, right) => String(toServerId(left)) === String(toServerId(right))
const clone = value => JSON.parse(JSON.stringify(value))
const validateNumericCell = (cell, path) => {
    if (!cell || !['analog', 'discrete'].includes(cell.type)) return
    const value = cell.value
    if (value === null || value === undefined || String(value).trim() === '') return
    if (typeof value === 'boolean' || !Number.isFinite(Number(value))) {
        throw new Error(`${path} must be a number; current value: ${String(value)}`)
    }
}

export const validateTestMeasurementValues = payload => {
    for (const test of (payload.testList || [])) {
        const label = test.testTypeName || test.name || 'Test'
        for (const [field, cell] of Object.entries(test.testCondition?.condition || {})) {
            validateNumericCell(cell, `${label} / testing conditions / ${field}`)
        }
        for (const [table, rows] of Object.entries(test.data || {})) {
            for (const [index, row] of (rows || []).entries()) {
                for (const [field, cell] of Object.entries(row || {})) {
                    validateNumericCell(cell, `${label} / ${table} row ${index + 1} / ${field}`)
                }
            }
        }
    }
}
const SERIES_MAPS = ['sfraTraces', 'ctExcitationPoints', 'ctExcitationKneePoints', 'cbMotorCurrentPoints', 'cbTimingTraces']
const ownedSeriesIds = test => {
    if (!test) return new Set()
    const table = (test.data && test.data.table) || {}
    const rows = Array.isArray(table) ? table : Object.values(table).flat()
    return new Set([test.mrid, test.testCondition && test.testCondition.mrid, ...rows.map(row => row && row.mrid)]
        .filter(Boolean).map(id => String(toServerId(id))))
}
const selectSeriesMap = (map, ids) => Object.fromEntries(Object.entries(map || {})
    .filter(([id]) => ids.has(String(toServerId(id)))))

export const serverDateTime = value => {
    if (value === null || value === undefined || value === '') return null
    const time = parseTestDate(value)
    if (time === null) throw new Error(`Invalid synchronization date: ${value}`)
    const date = new Date(time)
    const pad = number => String(number).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
        `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

export const selectTestDto = (jobDto, testId, linkKey) => {
    const dto = clone(jobDto)
    const test = (dto.testList || []).find(item => sameTestId(item.mrid, testId))
    if (!test) throw new Error('The selected test no longer exists. Refresh the tree and try again.')
    dto.testList = [test]
    const ownerIds = ownedSeriesIds(test)
    for (const key of SERIES_MAPS) {
        if (dto[key]) dto[key] = selectSeriesMap(dto[key], ownerIds)
    }
    const allLinks = dto[linkKey] || []
    const links = allLinks.filter(link => sameTestId(link.work_task_id, testId))
    dto[linkKey] = links
    const equipmentIds = new Set(links.map(link => String(toServerId(link.testing_equipment_id))))
    dto.testingEquipmentData = (dto.testingEquipmentData || []).filter(equipment =>
        equipmentIds.has(String(toServerId(equipment.mrid))) ||
        (!allLinks.length && (equipment.work_task_ids || []).some(id => sameTestId(id, testId)))
    ).map(equipment => ({ ...equipment, work_task_ids: [test.mrid] }))
    return dto
}

export const mergeTestIntoJobDto = (jobDto, testDto, linkKey) => {
    if (!jobDto) return clone(testDto)
    const merged = clone(jobDto)
    const selected = testDto.testList[0]
    const previous = (merged.testList || []).find(test => sameTestId(test.mrid, selected.mrid))
    const previousIds = ownedSeriesIds(previous)
    const incomingIds = ownedSeriesIds(selected)
    for (const key of SERIES_MAPS) {
        if (!merged[key] && !testDto[key]) continue
        const retained = Object.fromEntries(Object.entries(merged[key] || {})
            .filter(([id]) => !previousIds.has(String(toServerId(id)))))
        const incoming = clone(selectSeriesMap(testDto[key], incomingIds))
        // CT/CB SQLite writers replace only keys present in the new entity.
        // Keep an empty operation for a retained row whose curve was cleared.
        const cleared = key === 'sfraTraces' ? {} : Object.fromEntries(Object.keys(merged[key] || {})
            .filter(id => previousIds.has(String(toServerId(id))) && incomingIds.has(String(toServerId(id))) &&
                !Object.keys(incoming).some(next => sameTestId(next, id)))
            .map(id => [id, []]))
        merged[key] = { ...retained, ...cleared, ...incoming }
    }
    merged.testList = (merged.testList || []).filter(test => !sameTestId(test.mrid, selected.mrid))
    merged.testList.push(clone(selected))
    merged[linkKey] = (merged[linkKey] || []).filter(link => !sameTestId(link.work_task_id, selected.mrid))
    merged[linkKey].push(...clone(testDto[linkKey] || []))
    const equipment = new Map((merged.testingEquipmentData || []).map(item => [String(toServerId(item.mrid)), item]))
    for (const item of equipment.values()) {
        item.work_task_ids = (item.work_task_ids || []).filter(id => !sameTestId(id, selected.mrid))
    }
    for (const item of (testDto.testingEquipmentData || [])) {
        const key = String(toServerId(item.mrid))
        const existing = equipment.get(key)
        equipment.set(key, { ...existing, ...clone(item), work_task_ids: [...new Set([
            ...((existing && existing.work_task_ids) || []), ...(item.work_task_ids || [])
        ])] })
    }
    merged.testingEquipmentData = [...equipment.values()]
    merged.procedureAsset = [...new Map([
        ...(merged.procedureAsset || []), ...(testDto.procedureAsset || [])
    ].map(item => [item.mrid || `${item.asset_id}:${item.procedure_id}`, item])).values()]
    return merged
}

// Dataset ids also occur as dictionary keys and inside arrays. The generic
// entity-id cleaner only handles scalar object properties.
export const prepareTestUploadPayload = payload => {
    stripServerIdsDeep(payload)
    for (const test of (payload.testList || [])) test.createdOn = serverDateTime(test.createdOn)
    for (const equipment of (payload.testingEquipmentList || [])) {
        equipment.workTaskIds = (equipment.workTaskIds || []).map(toServerId)
        equipment.calibrationDate = serverDateTime(equipment.calibrationDate)
    }
    for (const key of SERIES_MAPS) {
        if (!payload[key]) continue
        payload[key] = Object.fromEntries(Object.entries(payload[key]).map(([id, value]) => [toServerId(id), value]))
    }
    return payload
}

export const testSnapshotDto = dto => {
    const snapshot = clone(dto)
    snapshot.properties = { asset_id: dto.properties.asset_id }
    snapshot.attachment = null
    snapshot.attachmentId = null
    snapshot.attachmentData = []
    for (const test of (snapshot.testList || [])) {
        if (!test.testCondition) continue
        test.testCondition.attachment = null
        test.testCondition.attachmentData = []
    }
    return snapshot
}

export const emptyEntityArrays = entity => {
    if (Array.isArray(entity)) return []
    if (!entity || typeof entity !== 'object') return entity
    return Object.fromEntries(Object.entries(entity).map(([key, value]) => [key, emptyEntityArrays(value)]))
}
