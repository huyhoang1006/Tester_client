/* eslint-disable no-console */
const assert = require('assert/strict')
const { createModuleLoader, makeFixture } = require('./check-test-sync-mappers.cjs')

const copy = value => JSON.parse(JSON.stringify(value))
const quiet = { ...console, log() {} }

async function run() {
    const snapshots = new Map()
    const jobs = new Map()
    const uploads = []
    const writes = []
    let remote
    let cancel = false
    const api = {
        getAssetByMrid: async () => ({ success: true, data: { mrid: '42@tf@u-21' } }),
        getWorkTasksByAssetId: async assetId => ({ success: true, data: [...jobs.values()]
            .filter(entity => entity.oldWork.asset_id === assetId)
            .flatMap(entity => entity.workTasks.map(task => ({ ...task, work_mrid: entity.oldWork.mrid }))) }),
        getTransformerJobByMrid: async id => ({ success: jobs.has(id), data: copy(jobs.get(id) || null) }),
        getOldWorkByAssetId: async assetId => ({ success: true, data: [...jobs.values()]
            .filter(entity => entity.oldWork.asset_id === assetId).map(entity => entity.oldWork) }),
        getEntitySnapshotByMrid: async id => ({ success: snapshots.has(id), data: snapshots.get(id) }),
        insertEntitySnapshot: async ({ mrid, snapshot }) => {
            snapshots.set(mrid, copy(snapshot))
            return { success: true }
        },
        readAbsoluteFileData: async () => ({ success: true, name: 'report.txt', mimeType: 'text/plain', base64: 'emVybw==' }),
        writeAttachmentFileData: async (base64, name) => {
            assert.equal(base64, 'emVybw==')
            return { success: true, path: 'D:/attachments/' + name }
        },
        insertTransformerJob: async (oldEntity, entity) => {
            writes.push({ oldEntity: copy(oldEntity), entity: copy(entity) })
            // Model the work_task FK update: a stable test can have only one parent.
            const ids = new Set(entity.workTasks.map(task => task.mrid))
            for (const existing of jobs.values()) {
                if (existing.oldWork.mrid === entity.oldWork.mrid) continue
                existing.workTasks = existing.workTasks.filter(task => !ids.has(task.mrid))
            }
            jobs.set(entity.oldWork.mrid, copy(entity))
            return { success: true, data: entity }
        }
    }
    const load = createModuleLoader({
        globals: { window: { electronAPI: api }, console: quiet },
        mocks: {
            '@/api/demo/Job': {
                uploadTest: async (kind, payload) => {
                    assert.equal(kind, 'Transformer')
                    assert.equal(payload.testList.length, 1)
                    uploads.push(copy(payload))
                    return { mrid: payload.testList[0].mrid, workMrid: 'remote-year', version: (payload.baseVersion || 0) + 1 }
                },
                downloadTest: async () => copy(remote)
            },
            '@/views/TreeNode/dialogs/showJobConflictDialog': {
                showJobConflictDialog: async () => { throw new Error('Unexpected conflict dialog') }
            }
        }
    })
    const local = load('@/views/Mapping/TransformerJob')
    const server = load('@/views/Mapping/ServerToDTO/TransformerJob')
    const { normalizeJobDto } = load('@/utils/jobDtoNormalize')
    const payloadHelpers = load('@/utils/testSyncPayload')
    const tests = load('@/config/test-definitions/Transformer').default
    const conditions = load('@/config/testing-condition/Transformer').default
    const code = Object.keys(tests).find(key => key !== 'SFRA')
    const assetId = '42@tf@u-21'
    const dto = makeFixture('Transformer', code, tests[code], conditions[code])
    dto.properties = { ...dto.properties, mrid: 'year-2026', name: 'Job 2026', asset_id: assetId, execution_date: '10/20/2026' }
    dto.testList[0].mrid = 'selected'
    dto.testList[0].testCondition.attachment.id_foreign = 'selected'
    dto.testList[0].testCondition.metadata.testing_date = '10/20/2026'
    dto.testingEquipmentData = []
    dto.transformerTestingEquipmentTestType = []
    const sibling = copy(dto.testList[0])
    sibling.mrid = 'sibling'
    sibling.name = 'Sibling untouched'
    sibling.testCondition.mrid = 'sibling-condition'
    sibling.testCondition.attachment = { id: null, path: '[]', id_foreign: 'sibling' }
    sibling.testCondition.attachmentData = []
    sibling.data.table = {}
    dto.testList.push(sibling)
    const initialEntity = local.jobDtoToEntity(normalizeJobDto(dto, 'transformerTestingEquipmentTestType', 'Transformer', 21))
    jobs.set('year-2026', initialEntity)
    const sync = load('@/utils/testSync')
    const node = { mrid: 'selected', parentId: assetId, workMrid: 'stale-work-id', job: 'Transformer', mode: 'test' }
    await sync.uploadSingleTest(node)
    assert.equal(uploads[0].testList[0].mrid, 'selected')
    assert.equal(uploads[0].job.assetId, '42')
    assert.equal(uploads[0].baseVersion, null)
    assert.equal(uploads[0].testList[0].testCondition.metadata.testing_date, '10/20/2026')
    assert.equal(uploads[0].testList[0].testCondition.attachmentData[0].base64, 'emVybw==')
    await sync.uploadSingleTest(node)
    assert.equal(uploads[1].baseVersion, 1)
    assert.equal(snapshots.get('selected').version, 2)

    remote = { ...copy(uploads[1]), version: 2 }
    await sync.downloadSingleTest({ ...node, parentId: '42' }, 21, async () => {})
    assert.deepEqual(jobs.get('year-2026').workTasks.map(task => task.mrid).sort(), ['selected', 'sibling'],
        'downloading an uploaded local test must retain its raw UUID without duplicating it')

    const incoming = payloadHelpers.selectTestDto(dto, 'selected', 'transformerTestingEquipmentTestType')
    incoming.testList[0].mrid = 'downloaded'
    incoming.testList[0].name = 'Server test'
    incoming.testList[0].testCondition.mrid = 'download-condition'
    incoming.testList[0].testCondition.metadata.testing_date = '10/21/2026'
    incoming.testList[0].testCondition.attachmentData = [{ name: 'report.txt', mimeType: 'text/plain', base64: 'emVybw==' }]
    incoming.testList[0].data.table = {}
    incoming.testingEquipmentData = [{ mrid: 'equipment', model: 'Meter', work_id: 'remote-job', work_task_ids: ['downloaded'] }]
    incoming.transformerTestingEquipmentTestType = [{ mrid: null, testing_equipment_id: 'equipment', work_task_id: 'downloaded' }]
    remote = { ...server.mapDtoToServer(incoming), version: 7 }
    remote.job.assetId = 42
    const downloadNode = { mrid: 'downloaded', parentId: '42', job: 'Transformer', mode: 'test' }
    await sync.downloadSingleTest(downloadNode, 21, async () => { if (cancel) throw 'cancel' })
    assert.equal(jobs.get('year-2026').workTasks.length, 3, 'download must retain both local sibling tests')
    const downloadedId = jobs.get('year-2026').workTasks.find(task => task.test_name === 'Individual test').mrid
    const scopedDownloaded = 'downloaded@task@u-21'
    assert.ok(jobs.get('year-2026').workTasks.some(task => task.mrid === scopedDownloaded))
    assert.equal(snapshots.get(scopedDownloaded).version, 7)
    const attachment = jobs.get('year-2026').attachmentTest.find(item => item.id_foreign === scopedDownloaded)
    assert.ok(attachment.path.includes('D:/attachments/'))
    const downloadedEntity = jobs.get('year-2026')
    assert.equal(downloadedEntity.testingEquipment[0].work_id, 'year-2026', 'equipment references the local year Job')
    assert.ok(downloadedEntity.transformerTestingEquipmentTestType[0].mrid, 'equipment link must have a local persistence id')
    assert.ok(!JSON.stringify(snapshots.get(scopedDownloaded)).includes('emVybw=='), 'do not duplicate file bytes in snapshots')

    // Move only the downloaded test to the previous year, preserving local siblings.
    remote.testList[0].testCondition.metadata.testing_date = '10/21/2025'
    remote.version = 8
    // Refresh the base to model an unmodified local test after first download.
    const { scopeJobDtoForUser } = load('@/views/TreeNode/Server/mixin/Download/job-id-scope')
    const baseDto = normalizeJobDto(server.mapServerToDto({ ...copy(remote), testList: [{ ...copy(remote.testList[0]), testCondition: { ...copy(remote.testList[0].testCondition), metadata: { ...remote.testList[0].testCondition.metadata, testing_date: '10/21/2026' } } }] }), 'transformerTestingEquipmentTestType', 'Transformer', 21)
    scopeJobDtoForUser(baseDto, 21, 'transformerTestingEquipmentTestType')
    snapshots.set(scopedDownloaded, { ...payloadHelpers.testSnapshotDto(baseDto), version: 7 })
    await sync.downloadSingleTest(downloadNode, 21, async () => {})
    const previous = [...jobs.values()].find(entity => entity.oldWork.name === 'Job 2025')
    assert.ok(previous)
    assert.equal(previous.workTasks.length, 1)
    assert.equal(previous.workTasks[0].mrid, scopedDownloaded)
    assert.deepEqual(jobs.get('year-2026').workTasks.map(task => task.mrid).sort(), ['selected', 'sibling'])
    assert.equal(previous.attachmentTest.find(item => item.id_foreign === scopedDownloaded).id, attachment.id, 'reuse the existing attachment row')

    remote.testList[0].testCondition.metadata.testing_date = ''
    remote.version = 9
    await sync.downloadSingleTest(downloadNode, 21, async () => {})
    const undated = [...jobs.values()].find(entity => entity.oldWork.name === 'Job No testing date')
    assert.ok(undated && undated.workTasks.some(task => task.mrid === scopedDownloaded))

    const writesBeforeCancel = writes.length
    await assert.rejects(sync.downloadSingleTest(downloadNode, 21, async () => { throw new Error('CANCELED') }), /CANCELED/)
    assert.equal(writes.length, writesBeforeCancel)
    assert.ok(downloadedId)

    const converted = payloadHelpers.prepareTestUploadPayload({
        testList: [{ mrid: scopedDownloaded }],
        testingEquipmentList: [{ mrid: 'eq@te@u-21', workTaskIds: [scopedDownloaded] }],
        sfraTraces: { 'row@ds@u-21': { mrid: 'trace@sfra@u-21', procedure_dataset_id: 'row@ds@u-21', points: [{ mrid: 'point@sp@u-21', frequency: '0' }] } }
    })
    assert.equal(converted.testingEquipmentList[0].workTaskIds[0], 'downloaded')
    assert.equal(converted.sfraTraces.row.procedure_dataset_id, 'row')
    assert.equal(converted.sfraTraces.row.points[0].frequency, '0')
    const seriesDto = {
        properties: { asset_id: assetId },
        testList: [
            { mrid: 'a', testCondition: { mrid: 'ca' }, data: { table: { table1: [{ mrid: 'ra' }] } } },
            { mrid: 'b', testCondition: { mrid: 'cb' }, data: { table: { table1: [{ mrid: 'rb' }] } } }
        ],
        testingEquipmentData: [], links: [],
        cbTimingTraces: { a: [{ magnitude: 'old-a' }], b: [{ magnitude: 'keep-b' }] },
        ctExcitationPoints: { ra: [{ current: 'old-a' }], rb: [{ current: 'keep-b' }] }
    }
    const selectedSeries = payloadHelpers.selectTestDto(seriesDto, 'a', 'links')
    assert.deepEqual(Object.keys(selectedSeries.cbTimingTraces), ['a'])
    assert.deepEqual(Object.keys(selectedSeries.ctExcitationPoints), ['ra'])
    selectedSeries.cbTimingTraces.a[0].magnitude = 'new-a'
    selectedSeries.ctExcitationPoints.ra[0].current = 'new-a'
    const mergedSeries = payloadHelpers.mergeTestIntoJobDto(seriesDto, selectedSeries, 'links')
    assert.equal(mergedSeries.cbTimingTraces.a[0].magnitude, 'new-a')
    assert.equal(mergedSeries.cbTimingTraces.b[0].magnitude, 'keep-b')
    assert.equal(mergedSeries.ctExcitationPoints.ra[0].current, 'new-a')
    assert.equal(mergedSeries.ctExcitationPoints.rb[0].current, 'keep-b')
    selectedSeries.ctExcitationPoints = {}
    selectedSeries.cbTimingTraces = {}
    const clearedSeries = payloadHelpers.mergeTestIntoJobDto(seriesDto, selectedSeries, 'links')
    assert.deepEqual(clearedSeries.ctExcitationPoints.ra, [], 'cleared CT curve must reach the SQLite writer')
    assert.deepEqual(clearedSeries.cbTimingTraces.a, [], 'cleared CB trace must reach the SQLite writer')
    assert.equal(clearedSeries.ctExcitationPoints.rb[0].current, 'keep-b')
    assert.equal(clearedSeries.cbTimingTraces.b[0].magnitude, 'keep-b')

    const cleared = copy(dto)
    cleared.testList[0].testCondition.attachmentData = []
    await sync.uploadTestDto('Transformer', assetId, 'selected', cleared, 2)
    assert.deepEqual(uploads[uploads.length - 1].testList[0].testCondition.attachmentData, [], 'explicit attachment removal must not revive old paths')
    assert.equal(payloadHelpers.serverDateTime('10/20/2026'), '2026-10-20T00:00:00')
    console.log('PASS: individual upload/download, version reuse, siblings, year moves, undated tests, attachments, cancel, and SFRA key normalization')
}

run().catch(error => { console.error(error); process.exitCode = 1 })
