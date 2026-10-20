/* eslint-disable no-console */
const assert = require('assert/strict')
const fs = require('fs')
const path = require('path')
const { createRequire } = require('module')
const babel = require('@babel/core')

const ROOT = path.resolve(__dirname, '..')
const ASSET_TYPES = [
    'Transformer', 'VoltageTransformer', 'CurrentTransformer', 'CircuitBreaker',
    'Disconnector', 'SurgeArrester', 'Bushing', 'PowerCable', 'RotatingMachine', 'Capacitor', 'Reactor',
]

// Isolated caches/mocks let integration tests use real mappers without booting Electron.
function createModuleLoader({ root = ROOT, mocks = {}, globals = {} } = {}) {
    const cache = new Map()
    const resolveFile = filename => {
        const candidates = [filename, filename + '.js', filename + '.json', filename + '.cjs', path.join(filename, 'index.js')]
        return candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile())
    }
    const load = (specifier, parent = path.join(root, '__harness__.js')) => {
        if (Object.prototype.hasOwnProperty.call(mocks, specifier)) return mocks[specifier]
        const filename = specifier.startsWith('@/')
            ? path.resolve(root, 'src', specifier.slice(2))
            : path.isAbsolute(specifier) ? specifier : specifier.startsWith('.')
                ? path.resolve(path.dirname(parent), specifier) : null
        if (!filename) return createRequire(parent)(specifier)
        const resolved = resolveFile(filename)
        if (!resolved) throw new Error('Cannot resolve ' + specifier + ' from ' + parent)
        if (Object.prototype.hasOwnProperty.call(mocks, resolved)) return mocks[resolved]
        if (cache.has(resolved)) return cache.get(resolved).exports
        const module = { exports: {} }
        cache.set(resolved, module)
        try {
            if (resolved.endsWith('.json')) {
                module.exports = JSON.parse(fs.readFileSync(resolved, 'utf8'))
                return module.exports
            }
            const localRequire = request => load(request, resolved)
            localRequire.context = (directory, recursive = false, pattern = /\.js$/) => {
                const base = path.resolve(path.dirname(resolved), directory)
                const entries = []
                const visit = (folder, prefix = './') => {
                    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
                        const key = prefix + entry.name
                        if (entry.isDirectory()) {
                            if (recursive) visit(path.join(folder, entry.name), key + '/')
                        } else {
                            pattern.lastIndex = 0
                            if (pattern.test(key)) entries.push(key)
                        }
                    }
                }
                visit(base)
                const context = key => load(path.resolve(base, key), resolved)
                context.keys = () => entries.slice().sort()
                context.resolve = key => path.resolve(base, key)
                return context
            }
            const code = babel.transformSync(fs.readFileSync(resolved, 'utf8'), {
                filename: resolved, babelrc: false, configFile: false,
                plugins: [
                    require.resolve('@babel/plugin-transform-dynamic-import'),
                    require.resolve('@babel/plugin-transform-modules-commonjs'),
                ],
            }).code
            const names = Object.keys(globals)
            new Function('require', 'module', 'exports', '__filename', '__dirname', ...names, code)(
                localRequire, module, module.exports, resolved, path.dirname(resolved), ...names.map(name => globals[name])
            )
            return module.exports
        } catch (error) {
            cache.delete(resolved)
            throw error
        }
    }
    const loadModule = specifier => load(specifier.startsWith('src/') || specifier.startsWith('tools/')
        ? path.resolve(root, specifier) : specifier)
    loadModule.cache = cache
    return loadModule
}

const loadModule = createModuleLoader()
const copy = value => JSON.parse(JSON.stringify(value))
const config = (kind, asset) => loadModule('@/config/' + kind + '/' + asset).default
const metadata = {
    name: 'Individual test', type: 'Acceptance', testing_date: '2026-10-20',
    tested_by: 'tester@example.com', approved_by: '', approved_date: '', reference_standard: 'IEC test reference',
}
const attachmentData = [{ name: 'trace.txt', base64: 'emVybw==', mimeType: 'text/plain' }]

function makeFixture(asset, code, testDefinition = {}, conditionDefinition = {}) {
    const cell = (column, suffix) => ({
        mrid: suffix + '-' + column.code,
        type: column.type, unit: column.unit || '', measurement_id: column.mrid,
        value: column.code === 'points_json' ? JSON.stringify([{ mrid: 'sfra-point', frequency: '0', magnitude: '-0.25', phase: '0' }])
            : column.type === 'analog' ? 0 : column.type === 'discrete'
                ? ((column.options || [])[0] || {}).alias ?? 0 : 'sample-' + column.code,
    })
    const fields = (definition, suffix) => Object.fromEntries((definition.columns || [])
        .filter(column => column.code).map(column => [column.code, cell(column, suffix)]))
    const linkKey = asset[0].toLowerCase() + asset.slice(1) + 'TestingEquipmentTestType'
    const references = [{ name: 'existing.txt', path: 'C:/existing.txt', serverId: 'reference-1' }]
    const dto = {
        properties: { mrid: 'job', name: 'Job', type: 'Maintenance', standard: 'job-standard', tested_by: 'job tester' },
        attachmentId: 'job-attachment', attachment: { id: 'job-attachment', path: '[]' }, attachmentData: references,
        testList: [{
            mrid: 'task', name: 'Instance ' + code, testTypeId: testDefinition.testId || 'unseeded-procedure',
            testTypeCode: code, testTypeName: testDefinition.testName || code, created_on: '2026-10-20',
            testCondition: {
                mrid: 'condition', comment: '', metadata: copy(metadata),
                attachment: { id: 'test-attachment', id_foreign: 'task', path: JSON.stringify(references) },
                attachmentData: copy(attachmentData), condition: fields(conditionDefinition, 'condition-cell'),
            },
            testAssessment: { testStandard: { mrid: 'selection', work_task_id: 'task' }, assessment: [] },
            data: { table: { table1: [{ mrid: 'row', ...fields(testDefinition, 'result-cell') }] } },
        }],
        testingEquipmentData: [{
            mrid: 'equipment', model: 'Model', serial_number: 'serial', calibration_date: '2026-01-01',
            work_id: 'job', work_task_ids: ['task'], manufacturer: 'Equipment maker', certificate: 'certificate-ref',
        }],
        [linkKey]: [{ mrid: 'equipment-link', testing_equipment_id: 'equipment', work_task_id: 'task' }],
        procedureAsset: [],
    }
    return dto
}

function run() {
    let definitions = 0
    let resultColumns = 0
    let conditionColumns = 0
    let assessmentDefinitions = 0
    const counts = []
    const quietLoader = createModuleLoader({ globals: { console: { ...console, log() {} } } })
    for (const asset of ASSET_TYPES) {
        const mapper = loadModule('@/views/Mapping/ServerToDTO/' + asset + 'Job')
        const local = quietLoader('@/views/Mapping/' + (asset === 'SurgeArrester' ? 'SurgerArrester' : asset) + 'Job')
        const tests = config('test-definitions', asset)
        const conditions = config('testing-condition', asset)
        const assessments = config('testing-assessment', asset)
        assessmentDefinitions += Object.keys(assessments).length
        const codes = new Set([...Object.keys(tests), ...Object.keys(conditions), ...Object.keys(assessments)])
        counts.push({ asset, tests: Object.keys(tests).length, conditions: Object.keys(conditions).length, assessments: Object.keys(assessments).length })
        definitions += Object.keys(tests).length
        // Empty asset configs still exercise the common shape and missing-code fallback.
        for (const code of [...codes, '__unseeded_test__']) {
            const fixture = makeFixture(asset, code, tests[code], conditions[code])
            const before = copy(fixture)
            const uploaded = mapper.mapDtoToServer(fixture)
            const downloaded = mapper.mapServerToDto(uploaded)
            assert.deepEqual(fixture, before, asset + '/' + code + ': upload mutates DTO')
            assert.deepEqual(downloaded.testList[0].testCondition.metadata, metadata)
            assert.deepEqual(downloaded.testList[0].testCondition.attachmentData, attachmentData)
            assert.deepEqual(downloaded.testList[0].testCondition.attachment, fixture.testList[0].testCondition.attachment)
            assert.deepEqual(downloaded.attachmentData, fixture.attachmentData)
            assert.equal(downloaded.properties.standard, 'job-standard')
            assert.equal(downloaded.testingEquipmentData[0].manufacturer, 'Equipment maker')
            assert.deepEqual(downloaded.testingEquipmentData[0].work_task_ids, ['task'])
            const secondUpload = mapper.mapDtoToServer(downloaded)
            assert.deepEqual(secondUpload.testList[0].data, uploaded.testList[0].data, asset + '/' + code + ': unstable data')
            for (const [kind, definition] of [['result', tests[code]], ['condition', conditions[code]]]) {
                for (const column of ((definition && definition.columns) || [])) {
                    if (!column.code) continue
                    if (kind === 'result') resultColumns += 1
                    else conditionColumns += 1
                    const original = kind === 'result' ? fixture.testList[0].data.table.table1[0][column.code]
                        : fixture.testList[0].testCondition.condition[column.code]
                    const actual = kind === 'result' ? downloaded.testList[0].data.table.table1[0][column.code]
                        : downloaded.testList[0].testCondition.condition[column.code]
                    assert.ok(actual, asset + '/' + code + '/' + column.code + ': missing column')
                    assert.equal(actual.measurement_id, original.measurement_id)
                    if (code === 'SFRA' && column.code === 'points_json') {
                        const points = JSON.parse(actual.value)
                        const originalPoints = JSON.parse(original.value)
                        assert.deepEqual(points.map(({ mrid, frequency, magnitude, phase }) => ({ mrid, frequency, magnitude, phase })), originalPoints)
                    } else assert.deepEqual(actual.value, code === 'SFRA' && kind === 'result' ? String(original.value) : original.value,
                        asset + '/' + code + '/' + column.code + ': field loss')
                }
            }
            const entity = local.jobDtoToEntity(downloaded)
            assert.ok(entity && entity.workTasks, asset + '/' + code + ': no entity')
            for (const value of [...entity.analogValues, ...entity.stringMeasurementValues]) {
                const source = Object.values(downloaded.testList[0].data.table).flat()
                    .flatMap(row => Object.values(row)).concat(Object.values(downloaded.testList[0].testCondition.condition))
                    .find(cell => cell && typeof cell === 'object' && cell.mrid === value.mrid)
                if (source) assert.equal(value.value, source.value, asset + '/' + code + ': DB-bound value lost')
            }
            let reloaded
            assert.doesNotThrow(() => { reloaded = local.JobEntityToDto(entity) }, asset + '/' + code + ': entity reload')
            for (const kind of ['result', 'condition']) {
                const source = kind === 'result' ? downloaded.testList[0].data.table.table1[0] : downloaded.testList[0].testCondition.condition
                const target = kind === 'result' ? reloaded.testList[0].data.table.table1[0] : reloaded.testList[0].testCondition.condition
                for (const [field, cell] of Object.entries(source)) {
                    if (!cell || typeof cell !== 'object' || !('measurement_id' in cell) || field === 'points_json') continue
                    assert.ok(target[field], asset + '/' + code + '/' + field + ': local reload dropped field')
                    assert.equal(target[field].value, cell.value, asset + '/' + code + '/' + field + ': local reload changed value')
                    assert.equal(target[field].unit || '', cell.unit || '', asset + '/' + code + '/' + field + ': local reload changed unit')
                }
            }
        }
        const shaped = makeFixture(asset, '__shape__')
        shaped.testList[0].data.table.table2 = [{ mrid: 'second-row', reading: { mrid: 'second-cell', type: 'analog', value: 0, measurement_id: 'second-measurement' } }]
        const shapedDto = mapper.mapServerToDto(mapper.mapDtoToServer(shaped))
        const shapedReload = local.JobEntityToDto(local.jobDtoToEntity(shapedDto))
        assert.deepEqual(Object.keys(shapedReload.testList[0].data.table).sort(), ['table1', 'table2'], asset + ': lost named table')
        assert.equal(shapedReload.testList[0].data.table.table2[0].reading.value, 0, asset + ': second table zero')
        const legacy = makeFixture(asset, '__legacy__')
        legacy.testList[0].data.table = legacy.testList[0].data.table.table1
        assert.equal(mapper.mapServerToDto(mapper.mapDtoToServer(legacy)).testList[0].data.table.table1[0].mrid, 'row')
        if (['Bushing', 'Capacitor', 'Reactor', 'RotatingMachine'].includes(asset)) {
            assert.equal(local.JobEntityToDto(local.jobDtoToEntity(legacy)).testList[0].data.table.table1[0].mrid, 'row')
        }
        // Both numeric zero and boolean false must survive every local mapper.
        for (const value of [0, false]) {
            const fixture = makeFixture(asset, '__zero__')
            fixture.testList[0].data.table.table1[0].zero = { mrid: 'zero-cell', measurement_id: 'zero-measurement', type: 'analog', value, unit: '' }
            fixture.testList[0].data.table.table1[0].flag = { mrid: 'flag-cell', measurement_id: 'flag-measurement', type: 'string', value, unit: '' }
            fixture.testList[0].data.table.table1[0].custom_discrete = { mrid: 'discrete-cell', measurement_id: 'discrete-measurement', type: 'discrete', value, unit: '' }
            fixture.testList[0].testCondition.condition.zero = { mrid: 'zero-condition', measurement_id: 'zero-condition-measurement', type: 'discrete', value, unit: '' }
            const entity = local.jobDtoToEntity(fixture)
            assert.equal(entity.analogValues.find(cell => cell.mrid === 'zero-cell').value, value, asset + ': numeric DB zero')
            assert.equal(entity.stringMeasurementValues.find(cell => cell.mrid === 'flag-cell').value, value, asset + ': false DB value')
            assert.equal(entity.discreteValues.find(cell => cell.mrid === 'discrete-cell').value, value, asset + ': discrete DB value')
            assert.equal(entity.discreteValues.find(cell => cell.mrid === 'zero-condition').value, value, asset + ': discrete condition DB zero')
            const reloaded = local.JobEntityToDto(entity)
            assert.equal(reloaded.testList[0].data.table.table1[0].zero.value, value)
            assert.equal(reloaded.testList[0].data.table.table1[0].flag.value, value)
            assert.equal(reloaded.testList[0].data.table.table1[0].custom_discrete.value, value, asset + ': arbitrary discrete reload')
            assert.equal(reloaded.testList[0].testCondition.condition.zero.value, value)
        }
    }
    checkAssessments()
    checkSeriesAndScopes()
    checkSfraRepresentations()
    const commonDefinitionFiles = fs.readdirSync(path.join(ROOT, 'src/config/test-definitions/Common')).filter(name => name.endsWith('.json')).length
    const summary = {
        assets: ASSET_TYPES.length, definitions, commonDefinitionFiles,
        conditionDefinitions: counts.reduce((sum, item) => sum + item.conditions, 0),
        resultColumns, conditionColumns, assessmentDefinitions, counts,
    }
    console.log(JSON.stringify(summary, null, 2))
    console.log('PASS: configured columns and units, metadata, attachments, table shapes, local DB-bound zeros, assessments, SFRA representations, special series, scopes, and immutability')
    return summary
}

function checkAssessments() {
    for (const asset of ASSET_TYPES) {
        const mapper = loadModule('@/views/Mapping/ServerToDTO/' + asset + 'Job')
        const fixture = makeFixture(asset, 'GeneralInspection')
        fixture.testList[0].testAssessment = {
            testStandard: { mrid: 'selection', work_task_id: 'task', test_standard_customize: 'custom', test_standard_ieee: 'fixed' },
            assessment: [
                { mrid: 'fixed', type: 'ieee', code: 'selected', tree: [] },
                { mrid: 'wrong-fixed', type: 'ieee', code: 'unselected', tree: [] },
                { mrid: 'custom', type: 'customized', standard_edition: '2026', tree: [{
                    mrid: 'group', rule_id: 'rule', result: 'Pass', priority: 0, is_default: '0', children: [{
                        mrid: 'child-group', rule_id: 'rule', conditions: [{ mrid: 'criterion', measurement_id: 'measurement', threshold: 0, operator: '>=' }],
                    }],
                }] },
            ],
        }
        const uploaded = mapper.mapDtoToServer(fixture)
        const assessment = uploaded.testList[0].assessment
        assert.deepEqual(assessment.fixedStandardRefs.map(item => item.mrid), ['fixed'])
        assert.equal(assessment.customizedStandards[0].assessment_group[1].parent_id, 'group')
        assert.equal(assessment.customizedStandards[0].assessment_group[0].is_default, false)
        assert.equal(assessment.customizedStandards[0].assessment_rule[0].priority, 0)
        const downloaded = mapper.mapServerToDto(uploaded)
        const custom = downloaded.testList[0].testAssessment.assessment.find(item => item.mrid === 'custom')
        assert.equal(custom.tree[0].children[0].conditions[0].threshold, 0)
        assert.equal(custom.standard_edition, '2026')
        assert.deepEqual(mapper.mapDtoToServer(downloaded).testList[0].assessment, assessment)
        const { scopeJobDtoForUser } = loadModule('@/views/TreeNode/Server/mixin/Download/job-id-scope')
        const linkKey = asset[0].toLowerCase() + asset.slice(1) + 'TestingEquipmentTestType'
        scopeJobDtoForUser(downloaded, 21, linkKey)
        const scopedAssessment = downloaded.testList[0].testAssessment
        const scopedCustom = scopedAssessment.assessment.find(item => item.type === 'customized' && item.mrid === 'custom@std@u-21')
        assert.equal(scopedAssessment.testStandard.test_standard_ieee, 'fixed')
        assert.equal(scopedAssessment.testStandard.test_standard_customize, scopedCustom.mrid)
        assert.equal(scopedCustom.assessment_rule[0].standard_id, scopedCustom.mrid)
        assert.equal(scopedCustom.tree[0].children[0].parent_id, scopedCustom.tree[0].mrid)
        assert.equal(scopedCustom.tree[0].children[0].conditions[0].measurement_id, 'measurement')
    }
}

function checkSeriesAndScopes() {
    const { scopeJobDtoForUser } = loadModule('@/views/TreeNode/Server/mixin/Download/job-id-scope')
    for (const [asset, keys] of [
        ['CurrentTransformer', ['ctExcitationPoints', 'ctExcitationKneePoints']],
        ['CircuitBreaker', ['cbMotorCurrentPoints', 'cbTimingTraces']],
        ['Transformer', ['sfraTraces']],
    ]) {
        const mapper = loadModule('@/views/Mapping/ServerToDTO/' + asset + 'Job')
        const fixture = makeFixture(asset, asset === 'Transformer' ? 'SFRA' : '__series__',
            asset === 'Transformer' ? config('test-definitions', asset).SFRA : {})
        for (const key of keys) {
            fixture[key] = key === 'sfraTraces' ? { row: { mrid: 'trace', procedure_dataset_id: 'row', points: [{ mrid: 'point', trace_id: 'trace', frequency: '0', magnitude: '0', phase: '0' }] } }
                : key === 'cbTimingTraces' ? { task: [{ mrid: 'trace', work_task_id: 'task', source_serial: 'source', points: [{ mrid: 'point', trace_id: 'trace', time: '0', value: '0' }] }] }
                    : { row: [{ mrid: 'point', procedure_dataset_id: 'row', current: '0', voltage: '0' }] }
        }
        const downloaded = mapper.mapServerToDto(fixture)
        const before = copy(downloaded)
        const scoped = scopeJobDtoForUser(copy(downloaded), 21, asset[0].toLowerCase() + asset.slice(1) + 'TestingEquipmentTestType')
        const other = scopeJobDtoForUser(copy(downloaded), 22, asset[0].toLowerCase() + asset.slice(1) + 'TestingEquipmentTestType')
        const again = copy(scoped)
        scopeJobDtoForUser(again, 21, asset[0].toLowerCase() + asset.slice(1) + 'TestingEquipmentTestType')
        assert.deepEqual(again, scoped, asset + ': scope not idempotent')
        assert.deepEqual(downloaded, before)
        for (const key of keys) {
            const mapKey = Object.keys(scoped[key])[0]
            const expected = key === 'cbTimingTraces' ? scoped.testList[0].mrid : scoped.testList[0].data.table.table1[0].mrid
            assert.equal(mapKey, expected, key + ': map key not scoped with its owner')
            const trace = key === 'sfraTraces' ? scoped[key][mapKey] : scoped[key][mapKey][0]
            const otherTrace = key === 'sfraTraces' ? Object.values(other[key])[0] : Object.values(other[key])[0][0]
            assert.notEqual(trace.mrid, otherTrace.mrid, key + ': cross-user ID collision')
            if (key === 'sfraTraces' || key === 'cbTimingTraces') {
                assert.equal(trace.points[0].trace_id, trace.mrid)
                assert.notEqual(trace.points[0].mrid, otherTrace.points[0].mrid)
            }
        }
        assert.equal(scoped.testingEquipmentData[0].mrid, 'equipment')
        assert.equal(scoped.testList[0].testTypeId, fixture.testList[0].testTypeId)
        if (asset === 'Transformer') {
            const uploaded = mapper.mapDtoToServer(scoped)
            const trace = Object.values(uploaded.sfraTraces)[0]
            assert.equal(trace.procedure_dataset_id, scoped.testList[0].data.table.table1[0].mrid)
            assert.equal(trace.points[0].frequency, '0')
            assert.equal(trace.points[0].trace_id, trace.mrid)
            const generated = loadModule('@/utils/sfraTrace').sfraTraceFromRow({
                mrid: 'row@ds@u-21', points_json: { value: '[[0,0,0],[1,1,1]]' },
            })
            assert.notEqual(generated.points[0].mrid.split('@')[0], generated.points[1].mrid.split('@')[0])
            assert.throws(() => loadModule('@/utils/sfraTrace').sfraTraceFromRow({ mrid: 'broken', points_json: { value: '{bad' } }), /Invalid SFRA/)
        }
    }
}

function checkSfraRepresentations() {
    const mapper = loadModule('@/views/Mapping/ServerToDTO/TransformerJob')
    const sfra = loadModule('@/utils/sfraTrace')
    const fixture = makeFixture('Transformer', 'SFRA')
    fixture.testList[0].data.table.table1[0].assessment = {
        mrid: 'sfra-result-cell', type: 'string', value: 'Reviewed', measurement_id: 'sfra-result-measurement',
    }
    const trace = {
        mrid: 'normalized-trace', procedure_dataset_id: 'row',
        trace_name: 'Normalized only', group_name: '', source_file: 'trace.xfra', output_voltage: '0',
        points: [
            { mrid: 'point-a', frequency: '0.000001', magnitude: '-0.0000000001', phase: '0' },
            { mrid: 'point-b', frequency: '1000000', magnitude: '0', phase: '-180' },
        ],
    }
    fixture.sfraTraces = { row: trace }
    const before = copy(fixture)
    const payload = mapper.mapDtoToServer(fixture)
    assert.equal(payload.sfraTraces.row.trace_name, trace.trace_name)
    assert.equal(payload.sfraTraces.row.output_voltage, '0')
    assert.deepEqual(payload.sfraTraces.row.points.map(({ frequency, magnitude, phase }) => ({ frequency, magnitude, phase })),
        trace.points.map(({ frequency, magnitude, phase }) => ({ frequency, magnitude, phase })))
    assert.equal(payload.testList[0].data.table1[0].assessment.value, 'Reviewed')
    const dto = mapper.mapServerToDto(payload)
    assert.equal(dto.testList[0].data.table.table1[0]._sfraTraceMrid, trace.mrid)
    assert.equal(dto.testList[0].data.table.table1[0].assessment.value, 'Reviewed')
    assert.deepEqual(fixture, before)
    dto.testList[0].data.table.table1[0].points_json.value = '[]'
    assert.deepEqual(mapper.mapDtoToServer(dto).sfraTraces.row.points, [])
    const tuples = sfra.sfraTraceFromRow({
        mrid: 'tuple-row@ds@u-21', points_json: { value: [[0, 0, 0], [1, -1, null]] }, output_voltage: { value: 0 },
    })
    assert.deepEqual(tuples.points.map(point => [point.frequency, point.magnitude, point.phase]), [['0', '0', '0'], ['1', '-1', null]])
    assert.equal(tuples.output_voltage, '0')
    const projected = sfra.sfraTraceToSnapshotCells({ ...trace, mrid: 'normalized-trace@trace@u-21' })
    const ids = Object.values(sfra.applySfraTraceToRow({ mrid: 'row' }, { ...trace, mrid: 'normalized-trace@trace@u-21' }))
        .filter(cell => cell && typeof cell === 'object' && cell.mrid).map(cell => cell.mrid.split('@')[0])
    assert.equal(new Set(ids).size, ids.length, 'SFRA virtual cell IDs collapse after scope stripping')
    assert.ok(Object.keys(projected).length > 0)
}

module.exports = { loadModule, createModuleLoader, run, ASSET_TYPES, makeFixture }
if (require.main === module) run()
