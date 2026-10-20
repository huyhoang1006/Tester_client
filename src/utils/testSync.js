import * as testAPI from '@/api/demo/Job'
import { toServerId, toLocalMrid } from '@/utils/serverId'
import { normalizeJobDto } from '@/utils/jobDtoNormalize'
import { scopeJobDtoForUser } from '@/views/TreeNode/Server/mixin/Download/job-id-scope'
import { scopeDownloadedId } from '@/views/TreeNode/Server/mixin/Download/id-scope'
import { testYearOf } from '@/views/TreeNode/Common/Fetch/testDate'
import { normaliseUnitsDeep } from '@/utils/unitNormalise'
import { mergeJob, applyJobResolution } from '@/utils/jobConflict'
import { showJobConflictDialog } from '@/views/TreeNode/dialogs/showJobConflictDialog'
import uuid from '@/utils/uuid'
import {
    sameTestId, selectTestDto, mergeTestIntoJobDto, prepareTestUploadPayload,
    testSnapshotDto, emptyEntityArrays
} from './testSyncPayload'

const STRATEGIES = {
    Transformer: ['Transformer', 'Transformer', 'transformer'],
    'Voltage transformer': ['VoltageTransformer', 'VoltageTransformer', 'voltageTransformer'],
    'Current transformer': ['CurrentTransformer', 'CurrentTransformer', 'currentTransformer'],
    'Circuit breaker': ['CircuitBreaker', 'CircuitBreaker', 'circuitBreaker'],
    Disconnector: ['Disconnector', 'Disconnector', 'disconnector'],
    'Surge arrester': ['SurgerArrester', 'SurgeArrester', 'surgeArrester'],
    'Power cable': ['PowerCable', 'PowerCable', 'powerCable'],
    Bushing: ['Bushing', 'Bushing', 'bushing'],
    Capacitor: ['Capacitor', 'Capacitor', 'capacitor'],
    Reactor: ['Reactor', 'Reactor', 'reactor'],
    'Rotating machine': ['RotatingMachine', 'RotatingMachine', 'rotatingMachine']
}

export const getTestSyncStrategy = async assetType => {
    const config = STRATEGIES[assetType]
    if (!config) throw new Error(`Test synchronization is not supported for ${assetType}`)
    const [localName, serverName, linkName] = config
    const [local, server] = await Promise.all([
        import(`@/views/Mapping/${localName}Job/index.js`),
        import(`@/views/Mapping/ServerToDTO/${serverName}Job/index.js`)
    ])
    const api = window.electronAPI
    return {
        local, server, linkKey: `${linkName}TestingEquipmentTestType`,
        read: id => api[`get${serverName}JobByMrid`](id),
        write: (oldEntity, entity) => api[`insert${serverName}Job`](oldEntity, entity)
    }
}

const checkResult = (result, label) => {
    if (!result || !result.success) throw new Error((result && result.message) || label)
    return result.data
}

const getSnapshot = async id => {
    const result = await window.electronAPI.getEntitySnapshotByMrid(id, 'work_task')
    return result && result.success ? result.data : null
}

const saveSnapshot = async (id, dto, version) => {
    const result = await window.electronAPI.insertEntitySnapshot({
        mrid: id, type: 'work_task', snapshot: { ...testSnapshotDto(dto), version }
    })
    checkResult(result, 'The test was synchronized, but its synchronization version could not be saved.')
}

const readTest = async (strategy, assetId, testId) => {
    const tasks = checkResult(await window.electronAPI.getWorkTasksByAssetId(assetId), 'Unable to load local tests')
    const task = (tasks || []).find(item => sameTestId(item.mrid, testId))
    if (!task) return null
    const entity = checkResult(await strategy.read(task.work_mrid || task.work), 'Unable to load the test Job')
    const dto = selectTestDto(strategy.local.JobEntityToDto(entity), task.mrid, strategy.linkKey)
    return { task, entity, dto }
}

const attachmentItems = condition => {
    if (Array.isArray(condition.attachmentData)) return condition.attachmentData
    const path = condition.attachment && condition.attachment.path
    if (!path) return []
    const items = typeof path === 'string' ? JSON.parse(path) : path
    return Array.isArray(items) ? items : []
}

const encodeAttachments = async condition => {
    const output = []
    for (const item of attachmentItems(condition)) {
        if (item.base64 !== undefined) {
            output.push({ name: item.name, mimeType: item.mimeType, base64: item.base64 })
            continue
        }
        if (!item.path) throw new Error('A test attachment has no local file. Download the attachment before uploading.')
        const file = await window.electronAPI.readAbsoluteFileData(item.path)
        checkResult(file, `Unable to read attachment ${item.name || item.path}`)
        output.push({ name: item.name || file.name, mimeType: file.mimeType, base64: file.base64 })
    }
    return output
}

const materializeAttachments = async (dto, userId, previousDto) => {
    for (const test of dto.testList) {
        const condition = test.testCondition
        const items = []
        for (const item of (condition.attachmentData || [])) {
            if (typeof item.base64 !== 'string') throw new Error('The server returned an attachment without file content.')
            const rawName = String(item.name || 'attachment').split(/[\\/]/).pop()
            const name = !rawName || rawName === '.' || rawName === '..' ? 'attachment' : rawName
            const file = await window.electronAPI.writeAttachmentFileData(
                item.base64, `test-sync/${encodeURIComponent(String(userId))}/${uuid.newUuid()}-${name}`
            )
            checkResult(file, `Unable to save attachment ${name}`)
            items.push({ name, path: file.path })
        }
        condition.attachmentData = items
        const previous = previousDto && (previousDto.testList || []).find(item => sameTestId(item.mrid, test.mrid))
        const previousAttachment = previous && previous.testCondition && previous.testCondition.attachment
        condition.attachment = {
            id: (previousAttachment && previousAttachment.id) || scopeDownloadedId(`attachment-${toServerId(test.mrid)}`, 'attachment', userId),
            id_foreign: test.mrid, type: 'test', name: null, path: JSON.stringify(items)
        }
    }
}

export const uploadTestDto = async (assetType, assetId, testId, jobDto, baseVersion) => {
    if (!/^[1-9]\d*$/.test(String(toServerId(assetId)))) {
        throw new Error('Upload the parent asset before uploading its tests.')
    }
    const strategy = await getTestSyncStrategy(assetType)
    const dto = selectTestDto(jobDto, testId, strategy.linkKey)
    const metadataName = dto.testList[0].testCondition && dto.testList[0].testCondition.metadata && dto.testList[0].testCondition.metadata.name
    if (metadataName) dto.testList[0].name = metadataName
    normaliseUnitsDeep(dto, 'upload')
    const payload = strategy.server.mapDtoToServer(dto)
    payload.job = { assetId: toServerId(assetId) }
    payload.testList[0].testCondition.attachmentData = await encodeAttachments(dto.testList[0].testCondition)
    payload.baseVersion = baseVersion
    prepareTestUploadPayload(payload)
    const response = await testAPI.uploadTest(assetType, payload)
    if (!response || response.version === undefined) throw new Error('The server did not return a test synchronization version.')
    return response
}

export const uploadSingleTest = async node => {
    const strategy = await getTestSyncStrategy(node.job)
    const local = await readTest(strategy, node.parentId, node.mrid)
    if (!local) throw new Error('The selected test no longer exists.')
    const dto = local.dto
    const snapshot = await getSnapshot(local.task.mrid)
    const response = await uploadTestDto(node.job, node.parentId, node.mrid, dto, snapshot ? snapshot.version : null)
    await saveSnapshot(local.task.mrid, dto, response.version)
    return response
}

export const downloadSingleTest = async (node, userId, confirmOverwrite) => {
    const strategy = await getTestSyncStrategy(node.job)
    let assetId = toLocalMrid(node.parentId, { mode: 'asset', asset: node.job }, userId)
    let asset = await window.electronAPI.getAssetByMrid(assetId)
    if ((!asset || !asset.success) && window.electronAPI.getIdentifiedObjectIdsByUser) {
        const owned = await window.electronAPI.getIdentifiedObjectIdsByUser(userId)
        const legacyId = toLocalMrid(node.parentId, { mode: 'asset', asset: node.job })
        if (owned && owned.success && Array.isArray(owned.data) && owned.data.includes(legacyId)) {
            asset = await window.electronAPI.getAssetByMrid(legacyId)
            if (asset && asset.success) assetId = legacyId
        }
    }
    // A test may only be downloaded under an asset already present on this machine.
    checkResult(asset, 'Download the parent asset first.')
    const response = await testAPI.downloadTest(node.job, node.mrid)
    if (!response || !Array.isArray(response.testList) || response.testList.length !== 1 ||
        !sameTestId(response.testList[0].mrid, node.mrid)) throw new Error('The server returned an invalid single-test response.')
    const serverDto = normalizeJobDto(strategy.server.mapServerToDto(response), strategy.linkKey, node.job, userId)
    serverDto.properties.asset_id = assetId
    const local = await readTest(strategy, assetId, serverDto.testList[0].mrid)
    // A locally created test already owns stable UUIDs without user suffixes.
    // Keep them on download; freshly downloaded records use scoped identifiers.
    if (!local || String(local.task.mrid).includes('@')) {
        scopeJobDtoForUser(serverDto, userId, strategy.linkKey)
    }
    for (const link of (serverDto[strategy.linkKey] || [])) {
        const previous = local && (local.dto[strategy.linkKey] || []).find(item =>
            sameTestId(item.work_task_id, link.work_task_id) && sameTestId(item.testing_equipment_id, link.testing_equipment_id)
        )
        link.mrid = (previous && previous.mrid) || link.mrid || uuid.newUuid()
    }
    const selected = serverDto.testList[0]
    let finalDto = serverDto
    if (local) {
        await confirmOverwrite(selected.name)
        const snapshot = await getSnapshot(local.task.mrid)
        if (snapshot) {
            const base = testSnapshotDto(snapshot)
            const client = testSnapshotDto(local.dto)
            const server = testSnapshotDto(serverDto)
            const result = mergeJob(base, client, server)
            finalDto = result.conflicts.length
                ? applyJobResolution(base, client, server, await showJobConflictDialog(result.conflicts, selected.name))
                : result.merged
            finalDto.properties = { ...serverDto.properties }
        }
    }
    normalizeJobDto(finalDto, strategy.linkKey, node.job, userId)
    // Attachments follow the version chosen by the download, independently of
    // local absolute paths which are deliberately excluded from field merging.
    finalDto.testList[0].testCondition.attachmentData = serverDto.testList[0].testCondition.attachmentData || []
    await materializeAttachments(finalDto, userId, local && local.dto)
    const metadata = finalDto.testList[0].testCondition.metadata || {}
    const year = testYearOf(metadata.testing_date)
    const name = year ? `Job ${year}` : 'Job No testing date'
    const works = checkResult(await window.electronAPI.getOldWorkByAssetId(assetId), 'Unable to find the test year Job')
    const target = (works || []).find(work => String(work.name || '').trim().toLowerCase() === name.toLowerCase())
    const targetId = target ? target.mrid : uuid.newUuid()
    let targetEntity = null
    let targetDto = null
    if (target) {
        targetEntity = checkResult(await strategy.read(targetId), 'Unable to load the target year Job')
        targetDto = strategy.local.JobEntityToDto(targetEntity)
    }
    finalDto.properties = {
        ...finalDto.properties, mrid: targetId, asset_id: assetId, name,
        execution_date: metadata.testing_date || null
    }
    const newDto = mergeTestIntoJobDto(targetDto, finalDto, strategy.linkKey)
    newDto.properties = { ...finalDto.properties }
    // Include only the previous selected test when it came from a different Job.
    // This lets the writer remove obsolete rows without deleting its siblings.
    const oldDto = local ? mergeTestIntoJobDto(targetDto, local.dto, strategy.linkKey) : targetDto
    if (oldDto) {
        oldDto.properties = { ...newDto.properties }
        oldDto.attachment = targetDto ? targetDto.attachment : null
        oldDto.attachmentId = targetDto ? targetDto.attachmentId : null
    }
    const normalizeLocalDto = dto => {
        normalizeJobDto(dto, strategy.linkKey, node.job, userId)
        dto.properties.asset_id = assetId
        for (const equipment of (dto.testingEquipmentData || [])) equipment.work_id = targetId
        return dto
    }
    const newEntity = strategy.local.jobDtoToEntity(normalizeLocalDto(newDto))
    const oldEntity = oldDto
        ? strategy.local.jobDtoToEntity(normalizeLocalDto(oldDto))
        : emptyEntityArrays(newEntity)
    oldEntity.oldWork.mrid = targetId
    checkResult(await strategy.write(oldEntity, newEntity), 'Unable to save the downloaded test')
    await saveSnapshot(finalDto.testList[0].mrid, serverDto, response.version)
    return { ...response, assetMrid: assetId }
}
