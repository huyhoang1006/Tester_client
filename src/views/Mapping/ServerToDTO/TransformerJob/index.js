import testMap from '@/config/test-definitions/Transformer'
import conditionMap from '@/config/testing-condition/Transformer'
import assessmentMap from '@/config/testing-assessment/Transformer'
import { applySfraTracesToTests, buildSfraTraceMap, SFRA_FIELD_CODES } from '@/utils/sfraTrace'

const clone = value => {
    if (Array.isArray(value)) return value.map(clone)
    if (!value || typeof value !== 'object') return value
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]))
}
const isCell = value => value && typeof value === 'object' && !Array.isArray(value)
    && ('measurement_id' in value || 'measurementId' in value || ('type' in value && 'value' in value))
const asBoolean = value => value === true || value === 1 || value === '1'
const joinUnit = unit => !unit || unit === 'null' || unit === 'undefined' ? null : unit.replace('|', '')
const splitUnit = unit => {
    if (!unit || unit === 'null' || unit === 'undefined') return null
    if (unit.includes('|')) return unit
    const match = unit.match(/^(k|M|G|m|\u00b5|u|n|p)(V|A|W|VA|var|Hz|s|F|H|Ohm|ohm)$/)
    return match ? match[1] + '|' + match[2] : unit
}
const attachments = holder => {
    const attachment = clone(holder.attachment || null)
    let data = holder.attachmentData
    if (data === undefined && attachment && attachment.path) {
        try { data = Array.isArray(attachment.path) ? attachment.path : JSON.parse(attachment.path) } catch (error) { data = [] }
    }
    return {
        attachmentId: holder.attachmentId ?? (attachment && (attachment.id || attachment.mrid || attachment.mRID)) ?? null,
        attachment,
        attachmentData: clone(Array.isArray(data) ? data : []),
    }
}

// A shared implementation lives here to keep all eleven owned mapper entry points in sync.
export const createJobServerMapper = (tests, conditions, assessments, linkKey, options = {}) => {
    const definition = (map, code) => map[code] || Object.values(map).find(item => item.testCode === code) || {}
    const columnFor = (code, field, condition) => (definition(condition ? conditions : tests, code).columns || [])
        .find(column => column.code === field)
    const columnById = new Map()
    for (const config of [tests, conditions]) {
        for (const item of Object.values(config)) {
            for (const column of (item.columns || [])) if (column.mrid) columnById.set(column.mrid, column)
        }
    }
    const mapCell = (cell, code, field, condition, download) => {
        if (!isCell(cell)) return clone(cell)
        const column = columnFor(code, field, condition) || {}
        const measurementId = cell.measurement_id || cell.measurementId || column.mrid || null
        const config = column.mrid === measurementId ? column : (columnById.get(measurementId) || column)
        const type = cell.type || config.type || null
        let value = cell.value ?? null
        if (type === 'discrete' && value !== null && value !== '') {
            const choice = (config.options || []).find(option => download
                ? String(option.value) === String(value)
                : option.alias === value)
            if (choice) value = download ? choice.alias : choice.value
            else if (!download && Number.isFinite(Number(value))) value = Number(value)
        } else if (!download && type === 'analog') {
            if (value === null || value === '') value = null
            else if (Number.isFinite(Number(value))) value = Number(value)
        }
        const unit = cell.unit ?? config.unit
        const out = {
            ...clone(cell), mrid: cell.mrid ?? null, type, value,
            unit: download ? (config.unit && joinUnit(config.unit) === joinUnit(unit) ? config.unit : splitUnit(unit)) : joinUnit(unit),
        }
        delete out[download ? 'measurementId' : 'measurement_id']
        out[download ? 'measurement_id' : 'measurementId'] = measurementId
        return out
    }
    const mapFields = (holder, code, condition, download) => Object.fromEntries(
        Object.entries(holder || {}).map(([field, cell]) => [field, mapCell(cell, code, field, condition, download)])
    )
    const mapTables = (data, code, download) => {
        const out = {}
        const source = (data && data.table) || data || {}
        const tables = Array.isArray(source) ? { table1: source } : source
        for (const [name, rows] of Object.entries(tables)) {
            if (!Array.isArray(rows)) continue
            const tableName = options.normalizeTables && /^\d+$/.test(name) ? 'table' + (Number(name) + 1) : name
            const mappedRows = rows.map(row => {
                const mapped = { mrid: row.mrid ?? null }
                for (const [field, cell] of Object.entries(row)) {
                    if (field === 'mrid' || field.startsWith('_')) continue
                    // SFRA's normalized fields are sent once; retain any other result columns.
                    if (!download && code === 'SFRA' && (SFRA_FIELD_CODES.includes(field) || field === 'points_json')) continue
                    mapped[field] = mapCell(cell, code, field, false, download)
                }
                if (download && row._sfraTraceMrid) mapped._sfraTraceMrid = row._sfraTraceMrid
                return mapped
            })
            out[tableName] = (out[tableName] || []).concat(mappedRows)
        }
        return download ? { table: out } : out
    }
    const flattenStandard = standard => {
        if (!Array.isArray(standard.tree)) return clone(standard)
        const rules = new Map()
        const groups = []
        const values = []
        const walk = (node, parentId = '') => {
            groups.push({
                mrid: node.mrid ?? '', rule_id: node.rule_id ?? '', parent_id: parentId,
                logic: node.logic ?? '', is_default: asBoolean(node.is_default),
            })
            if (node.rule_id && !rules.has(node.rule_id)) {
                rules.set(node.rule_id, {
                    mrid: node.rule_id, standard_id: standard.mrid ?? '',
                    result: node.result ?? '', priority: node.priority ?? '',
                })
            }
            for (const condition of (node.conditions || [])) values.push({ ...clone(condition), group_id: node.mrid ?? '' })
            for (const child of (node.children || [])) walk(child, node.mrid)
        }
        standard.tree.forEach(node => walk(node))
        const out = {
            ...clone(standard), assessment_rule: [...rules.values()], assessment_group: groups, assessment: values,
        }
        delete out.tree
        return out
    }
    const treeStandard = standard => {
        if (Array.isArray(standard.tree)) return clone(standard)
        const rules = new Map((standard.assessment_rule || []).map(rule => [rule.mrid, rule]))
        const groups = new Map((standard.assessment_group || []).map(group => [group.mrid, {
            ...clone(group), is_default: asBoolean(group.is_default), children: [], conditions: [],
            result: (rules.get(group.rule_id) || {}).result ?? '',
            priority: (rules.get(group.rule_id) || {}).priority ?? '',
        }]))
        const roots = []
        for (const group of groups.values()) {
            const parent = groups.get(group.parent_id)
            if (parent && parent !== group) parent.children.push(group)
            else roots.push(group)
        }
        for (const condition of (standard.assessment || [])) {
            const group = groups.get(condition.group_id)
            if (group) group.conditions.push(clone(condition))
        }
        return { ...clone(standard), tree: roots }
    }
    const mapAssessment = assessment => {
        if (!assessment) return null
        const standard = assessment.testStandard || {}
        const fixed = Object.fromEntries(Object.entries(standard)
            .filter(([key, value]) => key.startsWith('test_standard_') && key !== 'test_standard_customize' && value))
        const customizeId = standard.test_standard_customize || null
        if (!customizeId && !Object.keys(fixed).length) return null
        const chosen = new Set(Object.values(fixed))
        const definitions = assessment.assessment || []
        const custom = definitions.filter(item => item.type === 'customized' && item.mrid === customizeId).map(flattenStandard)
        const refs = definitions.filter(item => item.type && item.type !== 'customized' && chosen.has(item.mrid))
            .map(item => ({ mrid: item.mrid, type: item.type, code: item.code || '' }))
        return {
            standardMrid: standard.mrid ?? null, workTaskId: standard.work_task_id ?? null,
            fixedStandards: Object.keys(fixed).length ? fixed : null,
            fixedStandardRefs: refs.length ? refs : null, customizeId,
            customizedStandards: custom.length ? custom : null,
        }
    }
    const unmapAssessment = (test, code) => {
        const source = test.testAssessment || test.assessment
        const templates = clone(definition(assessments, code).testStandard || [])
        if (source && source.testStandard) {
            return { ...clone(source), assessment: (source.assessment || templates).map(treeStandard) }
        }
        const standard = {
            mrid: source ? source.standardMrid ?? null : null,
            work_task_id: source ? source.workTaskId ?? test.mrid ?? null : test.mrid ?? null,
            ...clone((source && source.fixedStandards) || {}),
            test_standard_customize: source ? source.customizeId ?? null : null,
        }
        const definitions = new Map(templates.map(item => [item.mrid, item]))
        for (const item of ((source && source.fixedStandardRefs) || [])) {
            definitions.set(item.mrid, { ...definitions.get(item.mrid), ...clone(item) })
        }
        for (const item of ((source && source.customizedStandards) || [])) definitions.set(item.mrid, clone(item))
        return { testStandard: standard, assessment: [...definitions.values()].map(treeStandard) }
    }
    const mapTest = (test, download) => {
        const code = test.testTypeCode || null
        const condition = test.testCondition
        const out = {
            mrid: test.mrid ?? null,
            name: test.name ?? test.testTypeName ?? null,
            testTypeId: test.testTypeId ?? definition(tests, code).testId ?? null,
            testTypeCode: code, testTypeName: test.testTypeName ?? definition(tests, code).testName ?? null,
            [download ? 'created_on' : 'createdOn']: test.created_on ?? test.createdOn ?? null,
            testCondition: condition ? {
                ...clone(condition),
                mrid: condition.mrid ?? null, comment: condition.comment ?? null,
                ...attachments(condition),
                metadata: clone(condition.metadata || {}),
                condition: mapFields(condition.condition, code, true, download),
            } : null,
            data: mapTables(test.data, code, download),
            [download ? 'testAssessment' : 'assessment']: download ? unmapAssessment(test, code) : mapAssessment(test.testAssessment),
        }
        if (test.metadata !== undefined) out.metadata = clone(test.metadata)
        for (const field of ['attachmentId', 'attachment', 'attachmentData']) {
            if (test[field] !== undefined) out[field] = clone(test[field])
        }
        return out
    }
    const propertyPairs = {
        mrid: 'mRID', name: 'name', type: 'type', creation_date: 'creationDate',
        execution_date: 'executionDate', tested_by: 'testedBy', approved_by: 'approvedBy',
        approval_date: 'approvalDate', test_method: 'testMethod', ref_standard: 'refStandard',
        standard: 'standard', summary: 'summary', asset_id: 'assetId',
    }
    const properties = (source, download) => Object.fromEntries(Object.entries(propertyPairs)
        .map(([local, remote]) => [download ? local : remote, source[local] ?? source[remote] ?? null]))
    const equipment = (source, download) => {
        const out = clone(source)
        for (const [local, remote] of Object.entries({
            serial_number: 'serialNumber', calibration_date: 'calibrationDate', work_id: 'workId', work_task_ids: 'workTaskIds',
        })) {
            delete out[download ? remote : local]
            out[download ? local : remote] = clone(source[local] ?? source[remote] ?? (local === 'work_task_ids' ? [] : null))
        }
        out.mrid = source.mrid ?? null
        out.model = source.model ?? null
        return out
    }
    const specialMaps = source => Object.fromEntries((options.series || [])
        .map(key => [key, clone(source[key] || {})]))
    const mapDtoToServer = dto => {
        if (!dto) return null
        const payload = {
            job: properties(dto.properties || {}, false),
            testList: (dto.testList || []).map(test => mapTest(test, false)),
            testingEquipmentList: (dto.testingEquipmentData || dto.testingEquipmentList || []).map(item => equipment(item, false)),
            ...attachments(dto),
            ...specialMaps(dto),
        }
        if (options.sfra) payload.sfraTraces = buildSfraTraceMap(dto.testList, dto.sfraTraces)
        return payload
    }
    const mapServerToDto = server => {
        if (!server) return null
        const dto = {
            properties: properties(server.properties || server.job || {}, true),
            testList: (server.testList || []).map(test => mapTest(test, true)),
            testingEquipmentData: (server.testingEquipmentData || server.testingEquipmentList || []).map(item => equipment(item, true)),
            procedureAsset: clone(server.procedureAsset || []),
            ...attachments(server),
            ...specialMaps(server),
        }
        const links = server[linkKey] || []
        dto[linkKey] = dto.testingEquipmentData.flatMap(item => item.work_task_ids.map(taskId => ({
            ...clone(links.find(link => link.testing_equipment_id === item.mrid && link.work_task_id === taskId) || {}),
            mrid: (links.find(link => link.testing_equipment_id === item.mrid && link.work_task_id === taskId) || {}).mrid ?? null,
            testing_equipment_id: item.mrid, work_task_id: taskId,
        })))
        if (options.sfra) {
            dto.sfraTraces = clone(server.sfraTraces || {})
            applySfraTracesToTests(dto.testList, dto.sfraTraces)
        }
        return dto
    }
    return { mapDtoToServer, mapServerToDto }
}

const mapper = createJobServerMapper(testMap, conditionMap, assessmentMap, 'transformerTestingEquipmentTestType', { sfra: true })
export const mapDtoToServer = mapper.mapDtoToServer
export const mapServerToDto = mapper.mapServerToDto
