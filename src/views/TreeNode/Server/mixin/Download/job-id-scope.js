import { scopeDownloadedId } from './id-scope'

const childId = (parent, suffix) => {
    const index = String(parent).indexOf('@')
    return index < 0 ? parent + '-' + suffix : String(parent).slice(0, index) + '-' + suffix + String(parent).slice(index)
}

const scopeAttachment = (attachment, userId) => {
    if (!attachment || typeof attachment !== 'object') return
    if (attachment.id) attachment.id = scopeDownloadedId(attachment.id, 'att', userId)
    if (attachment.id_foreign) attachment.id_foreign = scopeDownloadedId(attachment.id_foreign, 'task', userId)
    if (attachment.idForeign) attachment.idForeign = scopeDownloadedId(attachment.idForeign, 'task', userId)
}

const scopePoints = (points, userId, scope, traceId, datasetId) => {
    for (const [index, point] of (Array.isArray(points) ? points : []).entries()) {
        if (!point || typeof point !== 'object') continue
        const pointId = point.mrid || ((traceId || datasetId) && childId(traceId || datasetId, scope + '-' + index))
        if (pointId) point.mrid = scopeDownloadedId(pointId, scope, userId)
        if (point.procedure_dataset_id) point.procedure_dataset_id = scopeDownloadedId(point.procedure_dataset_id, 'ds', userId)
        if (traceId) point.trace_id = traceId
        else if (point.trace_id) point.trace_id = scopeDownloadedId(point.trace_id, 'trace', userId)
    }
}

const scopeSeriesMaps = (dto, userId) => {
    for (const key of ['ctExcitationPoints', 'ctExcitationKneePoints', 'cbMotorCurrentPoints', 'cbTimingTraces', 'sfraTraces']) {
        if (!dto[key] || typeof dto[key] !== 'object') continue
        dto[key] = Object.fromEntries(Object.entries(dto[key]).map(([id, value]) => {
            const scopedId = scopeDownloadedId(id, key === 'cbTimingTraces' ? 'task' : 'ds', userId)
            if (key === 'sfraTraces') {
                if (value && typeof value === 'object') {
                    value.procedure_dataset_id = scopedId
                    value.mrid = scopeDownloadedId(value.mrid || id, 'trace', userId)
                    scopePoints(value.points, userId, 'sfra-point', value.mrid)
                }
            } else if (key === 'cbTimingTraces') {
                for (const [index, trace] of (Array.isArray(value) ? value : []).entries()) {
                    if (!trace) continue
                    trace.work_task_id = scopedId
                    trace.mrid = scopeDownloadedId(trace.mrid || childId(id, 'trace-' + index), 'trace', userId)
                    scopePoints(trace.points, userId, 'cb-point', trace.mrid)
                }
            } else scopePoints(value, userId, key === 'cbMotorCurrentPoints' ? 'cb-point' : 'ct-point', null, scopedId)
            return [scopedId, value]
        }))
    }
}

/**
 * Gắn hậu tố người dùng cho một job tải từ server.
 *
 * ─── VÌ SAO KHÔNG QUÉT PHẲNG NHƯ SÁU FILE THIẾT BỊ ───────────────────────────
 *
 * Payload job trộn HAI LOẠI id, và cả hai đều khớp cùng một luật đặt tên (`mrid`,
 * `*_id`). Quét sạch một lượt là hỏng:
 *
 *   DỮ LIỆU NGƯỜI DÙNG — mỗi tài khoản một bản riêng, PHẢI gắn
 *     work, work_task, procedure_dataset (khối điều kiện + từng dòng bảng),
 *     analog_value / string_measurement_value / discrete_value (từng ô đo),
 *     test_standard, và toàn bộ chuỗi tiêu chuẩn TỰ ĐẶT
 *
 *   DANH MỤC CẤU HÌNH — nạp sẵn, giống hệt nhau ở mọi máy, TUYỆT ĐỐI không gắn
 *     procedure (82 bài test)        -> testTypeId
 *     measurement (137 cột đo)       -> measurement_id trong từng ô
 *     standard cố định (113)         -> tiêu chuẩn chọn từ danh mục
 *     testing_equipment              -> kho thiết bị, màn hình khác quản lý
 *
 * Gắn nhầm vào `measurement_id` thì `analog_value.analog` trỏ tới một cột đo không
 * tồn tại: bảng kết quả hiện trắng, không lỗi, không log. Đó là lý do file này liệt
 * kê từng đường một thay vì duyệt tất.
 *
 * ─── QUY TẮC MỘT CÂU ─────────────────────────────────────────────────────────
 *
 * Ô đo thì mrid của CHÍNH NÓ đổi, còn `measurement_id` BÊN TRONG nó giữ nguyên.
 * Hai người có hai ô riêng, nhưng cùng trỏ về một định nghĩa cột `r60s`.
 */

/** Ô đo: đổi mrid của ô, giữ nguyên measurement_id trỏ về danh mục cột. */
const scopeCell = (cell, userId) => {
    if (!cell || typeof cell !== 'object') return cell
    if (cell.mrid) cell.mrid = scopeDownloadedId(cell.mrid, 'val', userId)
    return cell
}

/** Mọi ô trong một dòng bảng hoặc trong khối điều kiện. */
const scopeCellsOf = (holder, userId) => {
    if (!holder || typeof holder !== 'object') return
    for (const key of Object.keys(holder)) {
        if (key === 'mrid') continue
        const value = holder[key]
        if (value && typeof value === 'object' && 'type' in value) scopeCell(value, userId)
    }
}

/**
 * Chuỗi tiêu chuẩn TỰ ĐẶT.
 *
 * Chỉ đụng vào tiêu chuẩn `type === 'customized'` — đó là thứ người dùng tự dựng cho
 * bài test của mình. Tiêu chuẩn cố định lấy từ danh mục seed thì để nguyên, gắn hậu tố
 * vào là bài test trỏ tới một tiêu chuẩn không có thật.
 *
 * Trong cây, `rule_id`, `parent_id` và `group_id` đều trỏ tới các bản ghi vừa được đổi
 * tên ngay bên trên, nên phải đổi theo cùng lượt, nếu không quan hệ đứt.
 * `measurement_id` ở điều kiện lá thì KHÔNG — nó trỏ về danh mục cột đo.
 */
const scopeStandardTree = (standard, userId) => {
    if (!standard || standard.type !== 'customized') return

    if (standard.mrid) standard.mrid = scopeDownloadedId(standard.mrid, 'std', userId)

    for (const rule of (standard.assessment_rule || [])) {
        if (rule.mrid) rule.mrid = scopeDownloadedId(rule.mrid, 'rule', userId)
        if (rule.standard_id) rule.standard_id = scopeDownloadedId(rule.standard_id, 'std', userId)
    }
    for (const group of (standard.assessment_group || [])) {
        if (group.mrid) group.mrid = scopeDownloadedId(group.mrid, 'grp', userId)
        if (group.rule_id) group.rule_id = scopeDownloadedId(group.rule_id, 'rule', userId)
        if (group.parent_id) group.parent_id = scopeDownloadedId(group.parent_id, 'grp', userId)
    }
    for (const condition of (standard.assessment || [])) {
        if (condition.mrid) condition.mrid = scopeDownloadedId(condition.mrid, 'cond', userId)
        if (condition.group_id) condition.group_id = scopeDownloadedId(condition.group_id, 'grp', userId)
    }

    const walk = (nodes) => {
        if (!Array.isArray(nodes)) return
        for (const node of nodes) {
            if (!node || typeof node !== 'object') continue
            if (node.mrid) node.mrid = scopeDownloadedId(node.mrid, 'grp', userId)
            if (node.rule_id) node.rule_id = scopeDownloadedId(node.rule_id, 'rule', userId)
            if (node.parent_id) node.parent_id = scopeDownloadedId(node.parent_id, 'grp', userId)

            if (Array.isArray(node.conditions)) {
                for (const cond of node.conditions) {
                    if (!cond || typeof cond !== 'object') continue
                    if (cond.mrid) cond.mrid = scopeDownloadedId(cond.mrid, 'cond', userId)
                    if (cond.group_id) cond.group_id = scopeDownloadedId(cond.group_id, 'grp', userId)
                    // cond.measurement_id: danh muc cot do — giu nguyen
                }
            }
            walk(node.children)
        }
    }
    walk(standard.tree)
}

/**
 * Gắn hậu tố cho toàn bộ job, sửa TẠI CHỖ.
 *
 * Gọi cho CẢ HAI bản — bản tải về và bản đang có ở máy — trước khi gộp. Chỉ gắn một
 * bên thì phép so đem `abc@val@u-21` đối chiếu với `abc`, thấy khác nhau ở mọi ô, và
 * sinh ra một rừng xung đột giả.
 *
 * `properties.mrid` cố ý KHÔNG đụng: mrid của chính job đã được chuỗi tải xuống gắn
 * hậu tố qua `toLocalMrid`, và `Download/job.js` gán lại nó ngay sau bước này.
 *
 * @param {object} dto    payload job dạng DTO
 * @param {number|string} userId
 * @param {string} linkKey tên khoá bảng nối thiết bị ↔ bài test của loại thiết bị này
 * @returns {object} chính `dto`
 */
export const scopeJobDtoForUser = (dto, userId, linkKey) => {
    if (!dto || !userId) return dto

    for (const test of (dto.testList || [])) {
        if (!test || typeof test !== 'object') continue

        if (test.mrid) test.mrid = scopeDownloadedId(test.mrid, 'task', userId)
        // test.testTypeId: danh muc 82 bai test — giu nguyen

        if (test.testCondition && typeof test.testCondition === 'object') {
            if (test.testCondition.mrid) {
                test.testCondition.mrid = scopeDownloadedId(test.testCondition.mrid, 'ds', userId)
            }
            scopeCellsOf(test.testCondition.condition, userId)
            if (test.testCondition.attachmentId) test.testCondition.attachmentId = scopeDownloadedId(test.testCondition.attachmentId, 'att', userId)
            scopeAttachment(test.testCondition.attachment, userId)
        }

        const tables = (test.data && test.data.table) || {}
        for (const tableName of Object.keys(tables)) {
            const rows = tables[tableName]
            if (!Array.isArray(rows)) continue
            for (const row of rows) {
                if (!row || typeof row !== 'object') continue
                if (row.mrid) row.mrid = scopeDownloadedId(row.mrid, 'ds', userId)
                scopeCellsOf(row, userId)
                if (test.testTypeCode === 'SFRA') {
                    if (row._sfraTraceMrid) row._sfraTraceMrid = scopeDownloadedId(row._sfraTraceMrid, 'trace', userId)
                    if (row.sfra_trace_id) row.sfra_trace_id = scopeDownloadedId(row.sfra_trace_id, 'trace', userId)
                    if (row.points_json) {
                        const cell = row.points_json
                        const raw = typeof cell === 'object' ? cell.value : cell
                        let points
                        try { points = Array.isArray(raw) ? raw : JSON.parse(raw) } catch (error) { points = null }
                        // Leave malformed legacy input intact so upload validation can report it.
                        if (Array.isArray(points)) {
                            scopePoints(points, userId, 'sfra-point', row._sfraTraceMrid || row.sfra_trace_id || row.mrid)
                            if (typeof cell === 'object') cell.value = JSON.stringify(points)
                            else row.points_json = JSON.stringify(points)
                        }
                    }
                }
            }
        }

        const ta = test.testAssessment
        if (ta && typeof ta === 'object') {
            if (ta.testStandard && ta.testStandard.mrid) {
                ta.testStandard.mrid = scopeDownloadedId(ta.testStandard.mrid, 'ts', userId)
            }
            if (ta.testStandard && ta.testStandard.work_task_id) {
                ta.testStandard.work_task_id = scopeDownloadedId(ta.testStandard.work_task_id, 'task', userId)
            }
            if (ta.testStandard && ta.testStandard.test_standard_customize) {
                ta.testStandard.test_standard_customize = scopeDownloadedId(ta.testStandard.test_standard_customize, 'std', userId)
            }
            for (const standard of (ta.assessment || [])) scopeStandardTree(standard, userId)
        }
    }

    // Bảng nối thiết bị ↔ bài test THUỘC VỀ JOB nên phải đổi theo. Nhưng
    // `testing_equipment_id` thì KHÔNG — nó trỏ vào kho thiết bị dùng chung, do màn
    // hình quản lý kho lo, job chỉ liên kết chứ không sở hữu.
    for (const link of (dto[linkKey] || [])) {
        if (!link || typeof link !== 'object') continue
        if (link.mrid) link.mrid = scopeDownloadedId(link.mrid, 'te-link', userId)
        if (link.work_task_id) link.work_task_id = scopeDownloadedId(link.work_task_id, 'task', userId)
    }

    // testingEquipmentData[].mrid la mrid THIET BI trong kho — giu nguyen.
    // Chi doi work_task_ids vi chung tro toi bai test vua duoc doi ten.
    for (const equipment of (dto.testingEquipmentData || [])) {
        if (!equipment || typeof equipment !== 'object') continue
        if (Array.isArray(equipment.work_task_ids)) {
            equipment.work_task_ids = equipment.work_task_ids
                .map(id => scopeDownloadedId(id, 'task', userId))
        }
    }

    scopeSeriesMaps(dto, userId)
    return dto
}
