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

    // 2b. procedureAsset — regen mrid (giữ procedure_id = seed định nghĩa procedure)
    if (Array.isArray(dto.procedureAsset)) {
        for (const pa of dto.procedureAsset) {
            pa.mrid = uuid.newUuid()
            pa.asset_id = newAssetId
            // procedure_id GIỮ NGUYÊN (trỏ định nghĩa procedure dùng chung)
        }
    }

    // 3. từng test trong testList
    for (const test of (dto.testList || [])) {
        // 3.0 mrid của CHÍNH test (work_task) — BẮT BUỘC regen, nếu không link tới
        // work_task cũ → không xóa được job mới (dùng chung record với job gốc).
        test.mrid = uuid.newUuid()
        // testTypeId / test_type_id GIỮ NGUYÊN (= procedure định nghĩa, dùng chung)

        // 3a. testCondition
        if (test.testCondition) {
            test.testCondition.mrid = uuid.newUuid()
            // work_task của testCondition trỏ test mới
            if (test.testCondition.work_task_id !== undefined) test.testCondition.work_task_id = test.mrid
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
// ---------------------------------------------------------------------------
// REGEN TOÀN BỘ ID cho "Create new" (giống deepImportService của Word/Excel).
// Không chỉ đổi mrid chính — phải regen MỌI id phụ (locationId, psrTypeId,
// organisationPsrId, lifecycleDateId, assetInfoId, các mrid nested...) để tạo
// bản sao ĐỘC LẬP hoàn toàn, tránh đụng record cũ. Đồng thời set liên kết cha
// theo NHÁNH đích (psrId/organisationId/substationId... = parent.mrid mới).
//
// Field KHÔNG đụng: userId, userName, *_unit, value, name, aliasName...
// ---------------------------------------------------------------------------
// Field *_id/*Id là DỮ LIỆU người dùng hoặc SEED dùng chung — KHÔNG regen.
//  - apparatus_id: mã thiết bị người dùng nhập ("Asset ID" trên form)
//  - measurement_id / test_type_id / testTypeId / procedure_id: trỏ ĐỊNH NGHĨA dùng chung
//  - userId / userName / userIdentifiedObjectId: của người dùng
const ID_KEEP = new Set([
    'userId', 'userName', 'userIdentifiedObjectId',
    'apparatus_id',
    'measurement_id', 'test_type_id', 'testTypeId', 'procedure_id',
])

// regen id với REMAP tham chiếu chéo (2 lượt).
// Vấn đề: DTO có liên kết nội bộ bằng id — vd impedances.prim_sec[].mrid được
// shortCircuitTestTransformerEndInfo[].short_circuit_test_id trỏ tới. Nếu đổi mrid
// nguồn mà không đổi tham chiếu → đứt link → MẤT dữ liệu (shortCircuitImpedance...).
// → Lượt 1: đổi mọi 'mrid', ghi map old→new. Lượt 2: thay mọi '*_id'/'*Id' bằng
//   new nếu old nằm trong map (tham chiếu nội bộ); nếu không có trong map → regen
//   (link ra ngoài, vẫn cần id mới để độc lập).
const regenIdsDeep = (root, uuid) => {
    const idMap = {}   // old mrid → new mrid

    // ── Lượt 1: đổi mọi 'mrid', ghi map ──
    const pass1 = (obj) => {
        if (!obj || typeof obj !== 'object') return
        if (Array.isArray(obj)) { for (const it of obj) pass1(it); return }
        const keys = Object.keys(obj)
        const hasOtherData = keys.some(k => {
            if (k === 'mrid') return false
            const v = obj[k]
            return v !== null && v !== undefined && v !== '' && typeof v !== 'object'
        })
        for (const k of keys) {
            const v = obj[k]
            if (k === 'mrid' && !ID_KEEP.has(k)) {
                if ((v !== null && v !== undefined && v !== '') || hasOtherData) {
                    const nm = uuid.newUuid()
                    if (v !== null && v !== undefined && v !== '') idMap[v] = nm
                    obj[k] = nm
                }
            } else if (v && typeof v === 'object') {
                pass1(v)
            }
        }
    }

    // ── Lượt 2: thay mọi field tham chiếu (*_id / *Id) ──
    const pass2 = (obj) => {
        if (!obj || typeof obj !== 'object') return
        if (Array.isArray(obj)) { for (const it of obj) pass2(it); return }
        for (const k of Object.keys(obj)) {
            const v = obj[k]
            if (k === 'mrid') continue   // đã xử lý lượt 1
            const isRef = (k.endsWith('_id') || k.endsWith('Id') || k.endsWith('mrid'))
            if (isRef && !ID_KEEP.has(k) && typeof v === 'string' && v) {
                if (idMap[v]) obj[k] = idMap[v]        // tham chiếu nội bộ → trỏ id mới
                else obj[k] = uuid.newUuid()           // link ngoài → id mới độc lập
            } else if (v && typeof v === 'object') {
                pass2(v)
            }
        }
    }

    pass1(root)
    pass2(root)
}

// "Create new": regen toàn bộ id + set lại liên kết cha theo nhánh đích.
const regenBranchIds = (branch, parentNode, uuid) => {
    const d = branch.data
    if (!d || !uuid || !uuid.newUuid) return
    const pmrid = parentNode && parentNode.mrid

    // 1) regen sâu mọi id trong DTO
    regenIdsDeep(d, uuid)

    // 2) đảm bảo mrid CHÍNH có giá trị mới (một số field đặc thù không khớp 'Id')
    switch (branch.type) {
        case 'organisation':
            if (!d.organisationId) d.organisationId = uuid.newUuid()
            if (d.organisation) d.organisation.mrid = d.organisationId
            // cha là org → set parentId
            if (parentNode && parentNode.mode === 'organisation') {
                d.parentId = pmrid
                if (d.organisation) d.organisation.parent_organisation = pmrid
            }
            break
        case 'substation':
            if (!d.subsId) d.subsId = uuid.newUuid()
            if (d.substation) d.substation.mrid = d.subsId
            // gắn vào org cha (qua organisation_psr): organisationId = parent.mrid
            d.organisationId = pmrid
            if (!d.organisationPsrId) d.organisationPsrId = uuid.newUuid()
            break
        case 'voltageLevel':
            if (!d.voltageLevelId) d.voltageLevelId = uuid.newUuid()
            if (d.voltageLevel) d.voltageLevel.mrid = d.voltageLevelId
            d.mrid = d.voltageLevelId
            d.substationId = pmrid
            break
        case 'bay': {
            const m = uuid.newUuid()
            d.mrid = m; d.bayId = m
            if (d.bay) d.bay.mrid = m
            // cha có thể là voltageLevel hoặc substation
            if (parentNode && parentNode.mode === 'voltageLevel') {
                d.voltage_level = pmrid; d.substation = null
            } else {
                d.substation = pmrid; d.voltage_level = null
            }
            break
        }
        case 'job':
            if (d.properties && !d.properties.mrid) d.properties.mrid = uuid.newUuid()
            break
        default: // asset
            if (d.properties && !d.properties.mrid) d.properties.mrid = uuid.newUuid()
            if (!d.assetInfoId) d.assetInfoId = uuid.newUuid()
            if (!d.assetPsrId) d.assetPsrId = uuid.newUuid()
            if (!d.productAssetModelId) d.productAssetModelId = uuid.newUuid()
            if (!d.lifecycleDateId) d.lifecycleDateId = uuid.newUuid()
            d.psrId = pmrid   // asset gắn vào bay/sub cha theo nhánh
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

    // Báo tiến trình: đang import node nào (tên + loại).
    if (deps.onProgress) {
        const nm = nodeDisplayName(branch)
        deps.onProgress({ name: nm, type: branch && branch.type })
        // nhả luồng 1 nhịp để Vue cập nhật thanh % trước khi insert (insert chặn lâu).
        await new Promise(r => setTimeout(r, 0))
    }

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
            regenBranchIds(branch, parentNode, deps.uuid)
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

// Tên hiển thị của 1 branch (cho thanh tiến trình).
const nodeDisplayName = (branch) => {
    const d = (branch && branch.data) || {}
    return d.name
        || (d.properties && (d.properties.name || d.properties.serial_no))
        || (d.voltageLevel && d.voltageLevel.name)
        || (d.substation && d.substation.name)
        || (d.organisation && d.organisation.name)
        || branch.asset
        || (branch && branch.type)
        || 'node'
}

// Đếm tổng số node trong các nhánh (để tính %).
const countTreeNodes = (branches) => {
    let n = 0
    const walk = (b) => {
        if (!b) return
        n++
        for (const c of (b.children || [])) walk(c)
    }
    for (const b of (branches || [])) walk(b)
    return n
}

// ---------------------------------------------------------------------------
// THỨ BẬC CÂY — để ghép đúng cấp (Cách A).
// node đích loại X → chỉ nhận con TRỰC TIẾP cấp kế (X+1) từ file, bỏ cấp cao hơn.
// ---------------------------------------------------------------------------
const HIERARCHY = ['organisation', 'substation', 'voltageLevel', 'bay', 'asset', 'job']
// org lồng org: organisation cũng nhận con organisation (xử lý riêng bên dưới).

const levelOf = (mode) => {
    const m = (mode === 'job') ? 'job' : (ASSET_TYPES_SET.has(mode) ? 'asset' : mode)
    return HIERARCHY.indexOf(m)
}

// Gom mọi branch ở đúng CẤP CON kế tiếp của targetMode, duyệt khắp file.
// vd targetMode='substation' (level 1) → gom mọi node level 2 (voltageLevel).
// Trả { grafts:[branch...], skipped:{ [mode]: count } } để báo người dùng.
const collectGraftBranches = (roots, targetMode) => {
    const targetLevel = levelOf(targetMode)
    const childLevel = targetLevel + 1
    const grafts = []
    const skipped = {}

    const walk = (branch) => {
        if (!branch || !branch.type) return
        const lv = levelOf(nodeModeOf(branch.type))

        if (lv === childLevel) {
            // đúng cấp con cần ghép → lấy nguyên subtree này
            grafts.push(branch)
            return   // không duyệt sâu hơn (subtree đi theo)
        }
        if (lv < childLevel) {
            // cấp cao hơn con cần ghép → bỏ qua node này, duyệt tiếp con
            const mode = nodeModeOf(branch.type)
            skipped[mode] = (skipped[mode] || 0) + 1
            for (const c of (branch.children || [])) walk(c)
        }
        // lv > childLevel: node quá sâu (không xảy ra nếu cây chuẩn) → bỏ
    }

    for (const r of (roots || [])) walk(r)
    return { grafts, skipped, childLevel }
}

// org lồng org: nếu đích là organisation và root file cũng organisation,
// thì KHÔNG bỏ org — org thành con của org đích (giữ nguyên root).
const isOrgIntoOrg = (roots, targetMode) =>
    targetMode === 'organisation'
    && (roots || []).some(r => nodeModeOf(r.type) === 'organisation')

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

    // ── GHÉP ĐÚNG CẤP (Cách A) ──────────────────────────────────────────────
    // node đích loại X → chỉ nhận con cấp kế (X+1) từ file, bỏ cấp cao hơn.
    // Ngoại lệ: org vào org (org lồng org) → giữ nguyên root organisation.
    const targetMode = targetNode.mode
    let branchesToImport = roots
    if (!isLegacyFlat) {
        if (isOrgIntoOrg(roots, targetMode)) {
            // org → org: import nguyên root (org thành con của org đích)
            branchesToImport = roots
        } else {
            const { grafts } = collectGraftBranches(roots, targetMode)
            if (grafts.length === 0) {
                messageHandler && messageHandler.warning(
                    'No matching nodes to graft into the selected target. Check the hierarchy level.')
                return
            }
            branchesToImport = grafts
        }
    }
    console.log(`[SERVICE] target=${targetMode} → ghép ${branchesToImport.length} nhánh (từ ${roots.length} root)`)

    let closeLoading = null
    if (loadingHandler && loadingHandler.start) closeLoading = loadingHandler.start()

    // Tổng số node để tính %.
    const totalNodes = countTreeNodes(branchesToImport)
    if (deps.onProgressInit) deps.onProgressInit(totalNodes)

    let ok = 0, fail = 0
    try {
        console.log(`%c[SERVICE] importBranchFromJSON: ${branchesToImport.length} branch(es), target=${targetNode.mrid}`, 'color:#3F51B5;font-weight:bold')
        for (const root of branchesToImport) {
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
export { regenJobDtoIds, regenStandardTree, branchMrid, collectGraftBranches, isOrgIntoOrg, levelOf, nodeModeOf }