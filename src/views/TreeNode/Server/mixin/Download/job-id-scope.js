import { scopeDownloadedId } from './id-scope'

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
        }

        const tables = (test.data && test.data.table) || {}
        for (const tableName of Object.keys(tables)) {
            const rows = tables[tableName]
            if (!Array.isArray(rows)) continue
            for (const row of rows) {
                if (!row || typeof row !== 'object') continue
                if (row.mrid) row.mrid = scopeDownloadedId(row.mrid, 'ds', userId)
                scopeCellsOf(row, userId)
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

    return dto
}
