/* eslint-disable */
import circuitBreakerTestMap from '@/config/test-definitions/CircuitBreaker'
import circuitBreakerConditionMap from '@/config/testing-condition/CircuitBreaker'

// Map measurement_id → { alias: value } cho cột discrete (từ config options).
// Dùng để convert discrete value chữ (UI: "Pass"/"Good") → số (server: 1/3),
// vì server tra value_alias bằng số.
const CB_DISCRETE_ALIAS_TO_VALUE = (() => {
    const map = {}
    const collect = (cfg) => {
        for (const testCode in cfg) {
            for (const col of (cfg[testCode]?.columns || [])) {
                if (col.type === 'discrete' && col.options && col.mrid) {
                    map[col.mrid] = {}
                    for (const o of col.options) map[col.mrid][o.alias] = o.value
                }
            }
        }
    }
    collect(circuitBreakerTestMap)
    collect(circuitBreakerConditionMap)
    return map
})()

// Convert discrete value: nếu là alias (chữ) → số theo config; nếu đã là số → giữ
const discreteToValue = (measurementId, value) => {
    if (value === null || value === undefined || value === '') return null
    const m = measurementId && CB_DISCRETE_ALIAS_TO_VALUE[measurementId]
    if (m && value in m) return m[value]   // chữ → số
    const n = Number(value)
    return Number.isNaN(n) ? value : n      // đã là số
}

// Map col.code → mrid (cột discrete) — dùng khi cell thiếu measurement_id.
// Vài component (COCOTiming/OCOCOTiming) từng tạo cell thiếu measurement_id;
// data cũ đã lưu vẫn null → tra lại từ config theo tên cột để convert chữ→số.
const CB_DISCRETE_MRID_BY_CODE = (() => {
    const map = {}
    const collect = (cfg) => {
        for (const testCode in cfg) {
            for (const col of (cfg[testCode]?.columns || [])) {
                if (col.type === 'discrete' && col.code && col.mrid) map[col.code] = col.mrid
            }
        }
    }
    collect(circuitBreakerTestMap)
    collect(circuitBreakerConditionMap)
    return map
})()

// Chuẩn hóa tên bảng: data cũ của OCTiming/COTiming lưu key số '0','1','2'
// thay vì 'table1','table2'. Đổi về tableN cho nhất quán toàn payload.
const normalizeTableName = (name) => {
    if (/^\d+$/.test(String(name))) return 'table' + (parseInt(name, 10) + 1)
    return name
}

// ═══════════════════════════════════════════════════════════════════════════════
// Mapper: DTO Job (Circuit Breaker) → server JSON (upload)
//
// Lược bỏ (tổ chức nội bộ client, KHÔNG gửi):
//   - procedureAsset            : ánh xạ test↔asset; server đã có procedure (seed config)
//   - voltageTransformerTestingEquipmentTestType : bảng nối thiết bị↔test;
//                                 server tự nối từ testingEquipmentData[].testTypeIds
//   - listHealth, *_score, weighting_factor : health index client tự tính
//
// Gửi lên:
//   - properties (header job)
//   - testList[] : mỗi test = condition + data + assessment
//   - testingEquipmentData[] : thiết bị nào đo bài nào (CẦN — không có thì hỏng)
//
// Customized standard: nếu test dùng customized → gửi kèm định nghĩa (assessment[].tree)
//                      tiêu chuẩn cố định (iec/ieee...) → chỉ gửi mrid tham chiếu
// ═══════════════════════════════════════════════════════════════════════════════

// số: '' / null → null
const num = (v) => (v !== null && v !== undefined && v !== '') ? parseFloat(v) : null
// unit DTO 'k|V' → server 'kV' (gộp, bỏ pipe); '' → null
const joinUnit = (u) => {
    if (!u || u === 'null' || u === 'undefined') return null
    return u.includes('|') ? u.replace('|', '') : u
}
// 1 ô đo {mrid,type,unit,value,measurement_id} → server cell.
// fieldKey = tên cột; dùng tra measurement_id từ config nếu cell thiếu (cột discrete).
const mapCell = (cell, fieldKey) => {
    if (!cell) return null
    let measurementId = cell.measurement_id || null
    if (!measurementId && fieldKey && CB_DISCRETE_MRID_BY_CODE[fieldKey]) {
        measurementId = CB_DISCRETE_MRID_BY_CODE[fieldKey]
    }
    let value
    if (cell.type === 'analog')        value = num(cell.value)
    else if (cell.type === 'discrete') value = discreteToValue(measurementId, cell.value)  // chữ → số
    else                                value = cell.value ?? null  // string
    return {
        // KHÔNG gửi mrid cell — id PK độc lập, server tự sinh khi lưu
        type:          cell.type || null,            // analog | string | discrete
        value,
        unit:          joinUnit(cell.unit),
        measurementId: measurementId || null,        // = column.mrid (khớp config seed) — GIỮ
    }
}

// condition: giữ nguyên dạng dict {tên cột: cell}
const mapCondition = (condition) => {
    if (!condition) return {}
    const out = {}
    for (const fieldKey of Object.keys(condition)) {
        const cell = mapCell(condition[fieldKey], fieldKey)
        if (cell) out[fieldKey] = cell
    }
    return out
}

// data.table → giữ row dạng dict {mRID, tên cột: cell}.
// data.table là object số bảng TÙY BIẾN: có bài 1 bảng (table1), có bài 2 bảng
// (table1+table2), có bài 3 bảng (table1+table2+table3). Duyệt Object.keys nên
// tự bắt mọi bảng, không hard-code tên/số lượng.
// Gộp cột/gộp dòng chỉ là cách UI render (colspan/rowspan) — dữ liệu lưu vẫn là
// row phẳng theo col.code, nên map theo dữ liệu thật, không quan tâm hiển thị.
const isCell = (v) =>
    v && typeof v === 'object' && !Array.isArray(v) &&
    ('measurement_id' in v || 'type' in v || 'value' in v)

const mapDataTable = (data) => {
    const out = {}
    const tables = (data && data.table) || {}
    for (const tableName of Object.keys(tables)) {
        const rows = tables[tableName]
        if (!Array.isArray(rows)) continue   // phòng cấu trúc lạ
        const outName = normalizeTableName(tableName)   // '0' → 'table1'
        out[outName] = rows.map(row => {
            const mapped = {}   // KHÔNG gửi mrid row — server tự sinh
            for (const fieldKey of Object.keys(row)) {
                if (fieldKey === 'mrid') continue
                const cell = row[fieldKey]
                if (isCell(cell)) mapped[fieldKey] = mapCell(cell, fieldKey)
            }
            return mapped
        })
    }
    return out
}

// Làm phẳng cây tree[] (form DTO, dùng cho client gen UI) → form config/DB:
// assessment_rule[] + assessment_group[] + assessment[] riêng biệt.
// Server đọc form này map thẳng vào bảng (rule/group/assessment).
const flattenTree = (tree, standardId) => {
    const rules = []
    const groups = []
    const assessments = []
    const seenRule = new Set()

    const walk = (node) => {
        if (!node) return
        // group = chính node (mang logic, parent, is_default)
        groups.push({
            mrid:       node.mrid || '',
            rule_id:    node.rule_id || '',
            parent_id:  node.parent_id || '',
            logic:      node.logic || '',
            is_default: !!node.is_default,
        })
        // rule = (rule_id + result), dedup vì nhiều group có thể chung 1 rule
        if (node.rule_id && !seenRule.has(node.rule_id)) {
            seenRule.add(node.rule_id)
            rules.push({
                mrid:        node.rule_id,
                standard_id: standardId || '',
                result:      node.result || '',
                priority:    node.priority || '',
            })
        }
        // assessment = các điều kiện trong group này
        for (const cond of (node.conditions || [])) {
            assessments.push({
                mrid:           cond.mrid || '',
                group_id:       cond.group_id || node.mrid || '',
                measurement_id: cond.measurement_id || '',
                operator:       cond.operator || '',
                threshold:      cond.threshold ?? '',
                label:          cond.label || '',
            })
        }
        for (const child of (node.children || [])) walk(child)
    }
    (tree || []).forEach(walk)
    return { rules, groups, assessments }
}

// testAssessment → server. Form khớp config/DB (testStandard có rule/group/assessment phẳng).
// Chỉ gửi định nghĩa customized (server không seed sẵn).
// Tiêu chuẩn cố định (iec/ieee...) → chỉ gửi mrid tham chiếu.
const mapAssessment = (testAssessment) => {
    if (!testAssessment) return null
    const ts  = testAssessment.testStandard || {}
    const asm = testAssessment.assessment || []

    // Người dùng CÓ CHỌN tiêu chuẩn không?
    //  - test_standard_customize có giá trị → đã chọn customized
    //  - test_standard_<loại cố định> có giá trị → đã chọn tiêu chuẩn cố định
    // Nếu KHÔNG chọn gì → không gửi assessment (dù assessment[] có sẵn template
    // do client load để hiển thị form). assessment[] chỉ là dữ liệu UI, không phải lựa chọn.
    const customizeId = ts.test_standard_customize || null

    const fixedStandards = {}
    for (const k of Object.keys(ts)) {
        if (k.startsWith('test_standard_') && k !== 'test_standard_customize' && ts[k]) {
            fixedStandards[k] = ts[k]
        }
    }
    const hasFixed = Object.keys(fixedStandards).length > 0

    // Không chọn tiêu chuẩn nào → không chấm → không gửi assessment
    if (!customizeId && !hasFixed) return null

    // Đã chọn CUSTOMIZED → gửi đầy đủ định nghĩa (server chưa seed).
    // Lấy đúng định nghĩa customized mà người dùng chọn (mrid = customizeId).
    let customizedStandards = null
    if (customizeId) {
        customizedStandards = asm
            .filter(a => a.type === 'customized' && a.mrid === customizeId)
            .map(a => {
                const { rules, groups, assessments } = flattenTree(a.tree, a.mrid)
                return {
                    mrid:             a.mrid || '',
                    code:             a.code || '',
                    name:             a.name || '',
                    type:             a.type,
                    standard_edition: a.standard_edition || '',
                    standard_number:  a.standard_number || '',
                    assessment_rule:  rules,
                    assessment_group: groups,
                    assessment:       assessments,
                }
            })
        if (!customizedStandards.length) customizedStandards = null
    }

    // Đã chọn tiêu chuẩn CỐ ĐỊNH → chỉ tham chiếu mrid (server đã seed, không gửi định nghĩa)
    let fixedStandardRefs = null
    if (hasFixed) {
        fixedStandardRefs = asm
            .filter(a => a.type && a.type !== 'customized')
            .map(a => ({ mrid: a.mrid || '', type: a.type, code: a.code || '' }))
        if (!fixedStandardRefs.length) fixedStandardRefs = null
    }

    return {
        standardMrid:        ts.mrid || null,
        workTaskId:          ts.work_task_id || null,
        fixedStandards:      hasFixed ? fixedStandards : null,
        fixedStandardRefs,
        customizeId,
        customizedStandards,
    }
}

export const mapDtoToServer = (dto) => {
    if (!dto) return null

    const p = dto.properties || {}

    return {
        job: {
            mRID:         p.mrid || null,
            name:         p.name || null,
            type:         p.type || null,
            creationDate: p.creation_date || null,
            executionDate:p.execution_date || null,
            testedBy:     p.tested_by || null,
            approvedBy:   p.approved_by || null,
            approvalDate: p.approval_date || null,
            testMethod:   p.test_method || null,
            refStandard:  p.ref_standard || null,
            standard:     p.standard || null,
            summary:      p.summary || null,
            assetId:      p.asset_id || null,
        },

        testList: (dto.testList || []).map(t => ({
            // KHÔNG gửi mrid work_task — server tự sinh
            testTypeId:  t.testTypeId || null,    // = procedure.mrid (khớp config seed) — GIỮ
            testTypeCode:t.testTypeCode || null,
            testTypeName:t.testTypeName || null,
            createdOn:   t.created_on || null,

            testCondition: t.testCondition ? {
                // KHÔNG gửi mrid condition — server tự sinh
                comment:   t.testCondition.comment || null,
                condition: mapCondition(t.testCondition.condition),
                // TODO attachment: hiện BỎ QUA (chưa có API upload file).
                // Khi có API: upload file trước, rồi gửi list file ở đây
                // y hệt attachmentId/attachmentData top-level của job.
            } : null,

            data: mapDataTable(t.data),

            assessment: mapAssessment(t.testAssessment),
        })),

        testingEquipmentList: (dto.testingEquipmentData || []).map(e => ({
            // KHÔNG gửi mrid equipment — server tự sinh
            model:           e.model || null,
            serialNumber:    e.serial_number || null,
            calibrationDate: e.calibration_date || null,
            // mảng testTypeId thiết bị này dùng để đo (= procedure.mrid, GIỮ để server nối)
            testTypeIds:     e.test_type_circuit_breaker_id || [],
        })),

        // attachment job-level: hiện chỉ gửi id tham chiếu.
        // Khi có API upload file: gửi thêm list file (attachmentData) tương tự.
        // Attachment trong từng test/condition cũng sẽ theo cùng format này.
        attachmentId: dto.attachmentId || null,
    }
}


// ═══════════════════════════════════════════════════════════════════════════════
// Mapper: server JSON (download) → DTO Job (Circuit Breaker)
//
// Chiều NGƯỢC của mapDtoToServer. Nhận JSON server trả về khi tải job/test
// (xem mockData download), dựng lại DTO mà JobView dùng.
//
// Khác upload:
//   - server cell có 'measurement_id' (snake) + 'mrid' (đã lưu) → DTO giữ nguyên 2 field
//   - server 'job' (camel) → DTO 'properties' (snake)
//   - discrete value: server lưu SỐ → đổi lại CHỮ (alias) cho UI hiển thị
//   - unit 'kV' (gộp) → DTO 'k|V' (tách pipe) để form chỉnh sửa được
// ═══════════════════════════════════════════════════════════════════════════════

// số server (number) → giữ; null → null
const numD = (v) => (v !== null && v !== undefined && v !== '') ? v : null
// unit server 'kV' → DTO 'k|V' (tách multiplier khỏi đơn vị cơ bản nếu nhận ra)
const splitUnit = (u) => {
    if (!u || u === 'null') return null
    // các multiplier SI thường gặp đứng trước đơn vị
    const m = u.match(/^(k|M|G|m|µ|u|n|p)(.+)$/)
    return m ? `${m[1]}|${m[2]}` : u
}
// discrete số → chữ (alias) theo config, để UI hiển thị; nếu ko tra được giữ nguyên
const discreteToAlias = (measurementId, value) => {
    if (value === null || value === undefined || value === '') return null
    const m = measurementId && CB_DISCRETE_ALIAS_TO_VALUE[measurementId]
    if (m) {
        for (const alias in m) if (m[alias] === value || String(m[alias]) === String(value)) return alias
    }
    return value
}

// 1 server cell {type,value,unit,measurement_id,mrid} → DTO cell
const unmapCell = (cell) => {
    if (!cell || typeof cell !== 'object') return cell
    const measurementId = cell.measurement_id || cell.measurementId || null
    let value
    if (cell.type === 'discrete') value = discreteToAlias(measurementId, cell.value)  // số → chữ
    else                          value = cell.value ?? null
    return {
        mrid:           cell.mrid || null,           // server đã lưu → giữ để update đúng record
        type:           cell.type || null,
        value,
        unit:           splitUnit(cell.unit),
        measurement_id: measurementId,               // snake — JobView đọc field này
    }
}

// 1 row server {mrid, <col>:cell} → DTO row (giữ mrid procedure_dataset + unmap mỗi cell)
const unmapRow = (row) => {
    const out = { mrid: row.mrid || null }
    for (const k of Object.keys(row)) {
        if (k === 'mrid' || k.startsWith('_')) continue
        const v = row[k]
        out[k] = (v && typeof v === 'object' && 'type' in v) ? unmapCell(v) : v
    }
    return out
}

// data.table server {table1:[...],table2:[...]} → DTO data {table:{...}}
const unmapDataTable = (data) => {
    const tables = (data && data.table) || data || {}
    const out = {}
    for (const tname of Object.keys(tables)) {
        const rows = tables[tname]
        if (!Array.isArray(rows)) continue
        out[normalizeTableName(tname)] = rows.map(unmapRow)
    }
    return { table: out }
}

// condition server {<col>:cell} → DTO condition
const unmapCondition = (condition) => {
    const out = {}
    for (const k of Object.keys(condition || {})) {
        const v = condition[k]
        out[k] = (v && typeof v === 'object' && 'type' in v) ? unmapCell(v) : v
    }
    return out
}

export const mapServerToDto = (server) => {
    if (!server) return null
    const p = server.properties || server.job || {}

    return {
        properties: {
            mrid:           p.mrid || p.mRID || null,
            name:           p.name || null,
            type:           p.type || null,
            creation_date:  p.creation_date || p.creationDate || null,
            execution_date: p.execution_date || p.executionDate || null,
            tested_by:      p.tested_by || p.testedBy || null,
            approved_by:    p.approved_by || p.approvedBy || null,
            approval_date:  p.approval_date || p.approvalDate || null,
            test_method:    p.test_method || p.testMethod || null,
            ref_standard:   p.ref_standard || p.refStandard || null,
            summary:        p.summary || null,
            asset_id:       p.asset_id || p.assetId || null,
        },

        testList: (server.testList || []).map(t => ({
            mrid:         t.mrid || null,             // work_task — giữ để update
            name:         t.name || t.testTypeName || null,
            testTypeId:   t.testTypeId || null,
            testTypeCode: t.testTypeCode || null,
            testTypeName: t.testTypeName || null,
            created_on:   t.created_on || t.createdOn || null,

            testCondition: t.testCondition ? {
                mrid:      t.testCondition.mrid || null,
                comment:   t.testCondition.comment || null,
                condition: unmapCondition(t.testCondition.condition),
            } : null,

            data: unmapDataTable(t.data),

            testAssessment: t.testAssessment || null,
        })),

        testingEquipmentData: (server.testingEquipmentData || server.testingEquipmentList || []).map(e => ({
            mrid:             e.mrid || null,
            model:            e.model || null,
            serial_number:    e.serial_number || e.serialNumber || null,
            calibration_date: e.calibration_date || e.calibrationDate || null,
            work_id:          e.work_id || null,
        })),

        // bảng nối thiết bị↔test (server trả mảng riêng)
        circuitBreakerTestingEquipmentTestType: server.circuitBreakerTestingEquipmentTestType || [],

        procedureAsset: server.procedureAsset || [],
        attachmentId:   server.attachmentId || null,
        attachment:     server.attachment || null,
    }
}