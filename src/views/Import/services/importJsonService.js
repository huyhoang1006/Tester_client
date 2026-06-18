/**
 * importJsonService.js
 * ----------------------------------------------------------------------------
 * Service import 1 NHÁNH cây từ JSON: đọc cây đã export, ghép NGUYÊN nhánh
 * vào làm CON của node đích đang chọn.
 *
 * Quy tắc:
 *  - DUYỆT DFS cha trước → con sau.
 *  - Mỗi node khi import được SINH mrid MỚI (tránh trùng máy khác / node cũ).
 *  - mrid mới của cha trở thành parentId cho con (giữ đúng quan hệ cây).
 *  - Validate cấp cha-con: hàm import từng loại tự chặn ghép sai
 *    (substation chỉ vào organisation/substation, bay vào substation/voltageLevel...).
 *  - Job: regen toàn bộ id tầng trong (work_task/cell/equipment + cây
 *    rule/group/assessment), gắn asset_id = mrid asset cha MỚI, rồi insert.
 *
 * Tương thích ngược: nếu file là MẢNG PHẲNG (format cũ) → import như cũ
 * (mỗi item thành con trực tiếp node đích, không đệ quy).
 *
 * dependencies:
 * {
 *   electronAPI,
 *   jobImporters,        // map TÊN asset → { jobDtoToEntity, insert, update } (cho job)
 *   uuid,                // { newUuid() }
 *   userId,
 *   messageHandler, loadingHandler,
 * }
 *
 * parentNode (node đích): { mode, mrid, parentId?, asset? }
 *
 * Xử lý xung đột (decisions): khi import nhận thêm map { [mrid]: action }:
 *   - OVERWRITE    : ghi đè giá trị node (giữ mrid); con KHÔNG xử lý.
 *   - NEW          : tạo mới (regen mrid); con xử lý tiếp.
 *   - USE_EXISTING : dùng node DB sẵn làm parent (không đụng); con xử lý tiếp.
 *   - mrid không có trong decisions = không trùng → tạo mới bình thường.
 * ----------------------------------------------------------------------------
 */

// Hằng số hành động xung đột — đồng bộ với CONFLICT_ACTION trong mridConflictScan.js
const CONFLICT_ACTION = {
    OVERWRITE: 'overwrite',
    NEW: 'new',
    USE_EXISTING: 'use_existing',
}

// ---------------------------------------------------------------------------
// Regen id cho 1 jobDto trước khi import (giống pattern cascading-regen mapper).
// Sinh mrid mới cho: work_task(properties.mrid), testCondition, từng row, từng
// cell, equipment; remap quan hệ equipment↔testType; với standardCustomized
// remap standard→rule→group(+parent_id)→assessment.
// Gắn asset_id = newAssetId (mrid asset cha mới).
// ---------------------------------------------------------------------------
const regenJobDtoIds = (jobDto, newAssetId, uuid) => {
    const dto = JSON.parse(JSON.stringify(jobDto)) // clone, không đụng bản gốc

    // 1. work_task (job) — sinh mrid mới, gắn asset cha mới
    if (!dto.properties) dto.properties = {}
    dto.properties.mrid = uuid.newUuid()
    dto.properties.asset_id = newAssetId

    // 2. testing equipment — sinh mrid mới + map id cũ → mới
    const equipMap = {}
    if (Array.isArray(dto.testingEquipmentData)) {
        for (const eq of dto.testingEquipmentData) {
            const oldId = eq.mrid
            eq.mrid = uuid.newUuid()
            eq.work_id = dto.properties.mrid
            if (oldId) equipMap[oldId] = eq.mrid
        }
    }
    // bảng nối equipment↔testType (tên field tùy asset: <asset>TestingEquipmentTestType)
    for (const key of Object.keys(dto)) {
        if (/TestingEquipmentTestType$/i.test(key) && Array.isArray(dto[key])) {
            for (const link of dto[key]) {
                link.mrid = uuid.newUuid()
                if (link.testing_equipment_id && equipMap[link.testing_equipment_id]) {
                    link.testing_equipment_id = equipMap[link.testing_equipment_id]
                }
                // test_type_id giữ nguyên (= procedure.mrid seed, dùng chung)
            }
        }
    }

    // 3. từng test trong testList
    for (const test of (dto.testList || [])) {
        // 3a. testCondition
        if (test.testCondition) {
            test.testCondition.mrid = uuid.newUuid()
            const cond = test.testCondition.condition || {}
            for (const k of Object.keys(cond)) {
                if (cond[k] && typeof cond[k] === 'object') cond[k].mrid = uuid.newUuid()
            }
        }
        // 3b. data.table — sinh mrid mới cho row + cell
        const table = (test.data && test.data.table) || {}
        for (const tableKey of Object.keys(table)) {
            const rows = table[tableKey]
            if (!Array.isArray(rows)) continue
            for (const row of rows) {
                if (row.mrid !== undefined) row.mrid = uuid.newUuid()
                for (const colKey of Object.keys(row)) {
                    const cell = row[colKey]
                    if (cell && typeof cell === 'object' && cell.mrid !== undefined) {
                        cell.mrid = uuid.newUuid()
                        // measurement_id giữ nguyên (= column.mrid seed, dùng chung)
                    }
                }
            }
        }
        // 3c. testAssessment / standardCustomized — regen cây rule/group/assessment
        regenTestAssessment(test, uuid)
    }

    // 4. standardCustomized ở cấp job (nếu mapper để ngoài testList)
    if (Array.isArray(dto.standardCustomized)) {
        dto.standardCustomized = dto.standardCustomized.map(std => regenStandardTree(std, uuid))
    }

    return dto
}

// Regen cây standard trong 1 test (cấu trúc testAssessment tùy mapping; xử lý
// linh hoạt: tìm các mảng assessment_rule / assessment_group / assessment).
const regenTestAssessment = (test, uuid) => {
    const ta = test.testAssessment
    if (!ta) return
    // testStandard.mrid (bản ghi chọn) — sinh mới nếu có
    if (ta.testStandard && ta.testStandard.mrid) ta.testStandard.mrid = uuid.newUuid()

    // assessment[] có thể là template chứa cây con; regen từng standard có rule/group
    if (Array.isArray(ta.assessment)) {
        ta.assessment = ta.assessment.map(std => {
            if (std && (std.assessment_rule || std.assessment_group || std.assessment)) {
                return regenStandardTree(std, uuid)
            }
            return std
        })
    }
}

// Regen 1 standard customized phẳng: standard.mrid → rule.standard_id,
// rule.mrid → group.rule_id, group.mrid → assessment.group_id VÀ group.parent_id.
const regenStandardTree = (std, uuid) => {
    const s = JSON.parse(JSON.stringify(std))
    const oldStdMrid = s.mrid
    s.mrid = uuid.newUuid()

    // rule
    const ruleMap = {}
    s.assessment_rule = (s.assessment_rule || []).map(r => {
        const nm = uuid.newUuid()
        ruleMap[r.mrid] = nm
        return { ...r, mrid: nm, standard_id: (r.standard_id === oldStdMrid ? s.mrid : (r.standard_id || s.mrid)) }
    })

    // group (2 pass: map trước, remap parent_id sau)
    const groupMap = {}
    const rawGroups = (s.assessment_group || []).map(g => {
        const nm = uuid.newUuid()
        groupMap[g.mrid] = nm
        return { ...g, mrid: nm, rule_id: ruleMap[g.rule_id] || g.rule_id }
    })
    s.assessment_group = rawGroups.map(g => ({
        ...g,
        parent_id: g.parent_id ? (groupMap[g.parent_id] || g.parent_id) : ''
    }))

    // assessment (biểu thức)
    s.assessment = (s.assessment || []).map(a => ({
        ...a, mrid: uuid.newUuid(), group_id: groupMap[a.group_id] || a.group_id
        // measurement_id giữ nguyên (= column.mrid seed)
    }))

    return s
}

// ---------------------------------------------------------------------------
// Import 1 node JOB: regen id → jobDtoToEntity → insert<Asset>Job
// parentNode = asset cha (đã có mrid MỚI sau khi asset import xong)
// ---------------------------------------------------------------------------
const importJobNode = async (branch, parentNode, deps) => {
    const { jobImporters, uuid, electronAPI } = deps
    const assetName = branch.asset
    console.log('%c[INS job:' + assetName + '] parent(asset)=' + parentNode.mrid, 'color:#E91E63')
    const def = jobImporters[assetName]
    if (!def) {
        console.warn(`[importJson] No job importer for asset: ${assetName}`)
        return null
    }
    try {
        const newJobDto = regenJobDtoIds(branch.data, parentNode.mrid, uuid)
        const entity = def.jobDtoToEntity(newJobDto)
        const res = await def.insert(electronAPI, null, entity)
        console.log('[INS job:' + assetName + '] insert result:', res)
        if (res && res.success) {
            return { mode: 'job', mrid: newJobDto.properties.mrid, parentId: parentNode.mrid, asset: assetName }
        }
        console.error(`[importJson] insert job FAILED:`, res && res.message, res)
        return null
    } catch (err) {
        console.error(`[importJson] Error importing job:`, err)
        return null
    }
}

// ---------------------------------------------------------------------------
// Import 1 node thường (organisation/substation/voltageLevel/bay/asset)
// nodeImporters[type](dto, parentNode, deps) → { entity, newNode } | null
// newNode = { mode, mrid (MỚI), asset? } để làm parent cho con.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Import 1 node thường: DTO → DtoToEntity → electronAPI.insert<X>Entity (nodeInserters).
// là renderer-side, tự gọi electronAPI.insert*Entity bên trong).
// Trả newNode { mode, mrid (MỚI), asset? } lấy từ importedNodes[0], hoặc null.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// Import 1 node thường: DTO → DtoToEntity → electronAPI.insert<X>Entity.
// Theo pattern deepImportService (Word/Excel). Mọi DB call qua electronAPI.
// deps.nodeInserters[type] = async (dto, parentNode, deps) => { mrid, mode } | null
// ---------------------------------------------------------------------------
const importNormalNode = async (branch, parentNode, deps) => {
    const { nodeInserters } = deps
    if (!branch || !branch.type) {
        console.warn('[importJson] Node missing "type" field — file format may be old/invalid. Node:', branch)
        return null
    }
    const inserter = nodeInserters[branch.type]
    if (!inserter) {
        console.warn(`[importJson] No inserter for type: ${branch.type}`)
        return null
    }
    try {
        const res = await inserter(branch.data, parentNode, deps)
        if (res && res.mrid && res.success !== false) return { mode: res.mode || nodeModeOf(branch.type), mrid: res.mrid, parentId: parentNode.mrid, asset: branch.asset }
        console.warn(`[importJson] insert FAILED type=${branch.type} mrid=${branchMrid(branch)} parent=${parentNode.mrid} message=`, res && res.message, '| result=', res)
        return null
    } catch (err) {
        console.error(`[importJson] Error importing node ${branch.type}:`, err)
        return null
    }
}

// ---------------------------------------------------------------------------
// OVERWRITE: ghi đè giá trị node đã tồn tại (GIỮ mrid cũ).
// LƯU Ý: insert*Entity là UPSERT (ON CONFLICT mrid DO UPDATE).
// Nên với node thường, OVERWRITE = gọi nodeInserter nhưng GIỮ NGUYÊN mrid
// (không xóa). Nếu import đúng vị trí cũ → hàm update; nếu khác vị trí, một số hàm
// (vd Bay/VoltageLevel) tự regen — đây là giới hạn tạm chấp nhận khi test.
// Job thì gọi update riêng (insert<Asset>Job với old=entity).
// ---------------------------------------------------------------------------
const overwriteNode = async (branch, parentNode, deps) => {
    const mrid = branchMrid(branch)
    if (branch.type === 'job') {
        const { jobImporters, electronAPI } = deps
        const def = jobImporters[branch.asset]
        if (!def || !def.update) {
            console.warn(`[importJson] No job updater for overwrite: ${branch.asset}`)
            return null
        }
        try {
            const entity = def.jobDtoToEntity(branch.data)   // giữ nguyên mrid trong dto
            const res = await def.update(electronAPI, entity)
            if (res && res.success) return { mode: 'job', mrid, parentId: parentNode.mrid, asset: branch.asset }
            return null
        } catch (err) {
            console.error('[importJson] Error overwriting job:', err)
            return null
        }
    } else {
        // node thường: giữ mrid → gọi nodeInserter (upsert theo mrid)
        return await importNormalNode(branch, parentNode, deps)
    }
}

// ---------------------------------------------------------------------------
// Lấy mrid của 1 node trong cây — mỗi type có cấu trúc data KHÁC nhau:
//   organisation : data.organisationId (DTO)
//   substation   : data.subsId (DTO)
//   voltageLevel : data.voltageLevel.mrid (raw entity lồng)
//   bay          : data.bay ? data.bay.mrid : data.mrid (raw entity)
//   asset (*)    : data.mrid (DTO phẳng)
//   job          : data.properties.mrid
// ---------------------------------------------------------------------------
const branchMrid = (branch) => {
    if (!branch || !branch.data) return null
    const d = branch.data
    switch (branch.type) {
        case 'job':          return d.properties && d.properties.mrid
        case 'organisation': return d.organisationId || (d.organisation && d.organisation.mrid) || d.mrid
        case 'substation':   return d.subsId || (d.substation && d.substation.mrid) || d.mrid
        case 'voltageLevel': return (d.voltageLevel && d.voltageLevel.mrid) || d.voltageLevelId || d.mrid
        case 'bay':          return (d.bay && d.bay.mrid) || d.bayId || d.mrid
        // asset types: DTO lồng, mrid ở data.properties.mrid
        default:             return (d.properties && d.properties.mrid) || d.mrid
    }
}

// Xóa/đặt mrid của node (dùng khi NEW: ép tạo mới bằng cách bỏ mrid).
// Mỗi type set vào đúng chỗ — nhưng các hàm import có sẵn tự regen khi thiếu mrid,
// nên chỉ cần xóa mrid ở vị trí chính là đủ để chúng coi như node mới.
const clearBranchMrid = (branch) => {
    const d = branch.data
    if (!d) return
    switch (branch.type) {
        case 'job':          if (d.properties) d.properties.mrid = ''; break
        case 'organisation': d.organisationId = ''; if (d.organisation) d.organisation.mrid = ''; break
        case 'substation':   d.subsId = ''; if (d.substation) d.substation.mrid = ''; break
        case 'voltageLevel': if (d.voltageLevel) d.voltageLevel.mrid = ''; d.voltageLevelId = ''; break
        case 'bay':          if (d.bay) d.bay.mrid = ''; d.bayId = ''; d.mrid = ''; break
        default:             if (d.properties) d.properties.mrid = ''; d.mrid = ''   // asset
    }
}

// ---------------------------------------------------------------------------
// ĐỆ QUY DFS có XỬ LÝ QUYẾT ĐỊNH XUNG ĐỘT
// decisions = { [mrid]: 'overwrite' | 'new' | 'use_existing' }  (chỉ chứa node TRÙNG)
//
// Quy tắc:
//  - mrid KHÔNG trong decisions (không trùng)  → tạo mới; con xử lý tiếp.
//  - OVERWRITE     → ghi đè giá trị (giữ mrid); CON KHÔNG xử lý (cắt nhánh).
//  - NEW           → tạo mới (regen mrid);     con xử lý tiếp.
//  - USE_EXISTING  → KHÔNG đụng node DB (dùng làm parent); con xử lý tiếp.
// ---------------------------------------------------------------------------
const importBranch = async (branch, parentNode, deps, decisions) => {
    const mrid = branchMrid(branch)
    const action = decisions && mrid ? decisions[mrid] : undefined
    console.log(`%c[BRANCH] type=${branch && branch.type} mrid=${mrid} action=${action || 'NONE'} parent=${parentNode && parentNode.mrid}`, 'color:#9C27B0;font-weight:bold')

    let newNode = null
    let recurseChildren = true

    if (action === CONFLICT_ACTION.OVERWRITE) {
        newNode = await overwriteNode(branch, parentNode, deps)
        recurseChildren = false

    } else if (action === CONFLICT_ACTION.USE_EXISTING) {
        newNode = { mode: nodeModeOf(branch.type), mrid, parentId: parentNode.mrid, asset: branch.asset }
        recurseChildren = true

    } else {
        if (action === CONFLICT_ACTION.NEW) {
            clearBranchMrid(branch)
        }
        if (branch.type === 'job') {
            newNode = await importJobNode(branch, parentNode, deps)
            recurseChildren = false
        } else {
            newNode = await importNormalNode(branch, parentNode, deps)
            recurseChildren = true
        }
    }

    if (!newNode) {
        console.warn(`%c[BRANCH] ✗ FAILED — skipping subtree: type=${branch && branch.type}`, 'color:#F44336;font-weight:bold')
        return
    }
    console.log(`%c[BRANCH] ✓ OK type=${branch.type} → newNode.mrid=${newNode.mrid} (recurseChildren=${recurseChildren}, ${(branch.children || []).length} children)`, 'color:#009688')

    if (recurseChildren) {
        for (const child of (branch.children || [])) {
            await importBranch(child, newNode, deps, decisions)
        }
    }
}

// type trong file (vd 'voltageTransformer') → mode node của cây ('asset' cho asset, còn lại giữ nguyên)
const ASSET_TYPES_SET = new Set(['surgeArrester','powerCable','disconnector','rotatingMachine','capacitor',
    'voltageTransformer','currentTransformer','transformer','breaker','reactor','bushing'])
const nodeModeOf = (type) => {
    if (type === 'job') return 'job'
    if (ASSET_TYPES_SET.has(type)) return 'asset'
    return type   // organisation/substation/voltageLevel/bay
}

// ---------------------------------------------------------------------------
// ENTRY: import file JSON vào node đích
// fileContent: object đã JSON.parse — format cây { version, roots } hoặc phẳng cũ [ ... ]
// decisions (optional): { [mrid]: action } từ ImportConflictDialog. Không có = không trùng.
// ---------------------------------------------------------------------------
export const importBranchFromJSON = async (fileContent, targetNode, deps, decisions = null) => {
    const { messageHandler, loadingHandler } = deps

    if (!targetNode || !targetNode.mrid) {
        messageHandler && messageHandler.warning('No target node selected to import into')
        return
    }

    // Chuẩn hóa về mảng roots
    let roots = []
    let isLegacyFlat = false
    // Trường hợp data bị bọc mảng [ {version, roots} ] → bóc ra
    if (Array.isArray(fileContent) && fileContent.length === 1 && fileContent[0] && fileContent[0].roots) {
        fileContent = fileContent[0]
    }
    if (fileContent && Array.isArray(fileContent.roots)) {
        roots = fileContent.roots
    } else if (Array.isArray(fileContent)) {
        roots = fileContent.map(item => ({ ...item, children: item.children || [] }))
        isLegacyFlat = true
    } else {
        messageHandler && messageHandler.error('Invalid JSON file format')
        return
    }

    if (roots.length === 0) {
        messageHandler && messageHandler.warning('JSON file is empty')
        return
    }

    let closeLoading = null
    if (loadingHandler && loadingHandler.start) closeLoading = loadingHandler.start()

    let ok = 0, fail = 0
    try {
        console.log(`%c[SERVICE] importBranchFromJSON: ${roots.length} root(s), target=${targetNode.mrid}`, 'color:#3F51B5;font-weight:bold')
        for (const root of roots) {
            try {
                await importBranch(root, targetNode, deps, decisions)
                ok++
            } catch (err) {
                console.error('[SERVICE] Error importing one root:', err)
                fail++
            }
        }
        console.log(`%c[SERVICE] DONE: ok=${ok} fail=${fail}`, 'color:#3F51B5;font-weight:bold')
        if (fail === 0) {
            messageHandler && messageHandler.success(
                isLegacyFlat ? `Imported ${ok} item(s) successfully` : `Imported ${ok} branch(es) successfully`)
        } else {
            messageHandler && messageHandler.warning(`Import done: ${ok} succeeded, ${fail} failed`)
        }
    } catch (err) {
        console.error('[SERVICE] Import error:', err)
        messageHandler && messageHandler.error('An error occurred while importing JSON')
        throw err
    } finally {
        if (closeLoading) closeLoading()
    }
}

// Xuất các helper để test/độc lập nếu cần
export { regenJobDtoIds, regenStandardTree, branchMrid }