/**
 * Vá payload job từ server cho khớp thứ các mapper phía client mong đợi.
 *
 * Sáu mapper chiều xuống (`jobDtoToEntity`) và sáu màn hình JobView đều được viết
 * cho payload do CHÍNH CLIENT sinh ra, nơi mọi khối luôn có mặt. Payload từ server
 * thì không:
 *
 *   - `attachment` luôn null, vì API tệp chưa chốt
 *   - `testCondition` null với bài test chưa nhập điều kiện
 *   - `data.table` vắng nếu bài test chưa có bảng nào
 *
 * Đưa thẳng vào mapper là vỡ ở `dto.attachment.path` hoặc
 * `item.testCondition.comment` — TypeError trần trụi, chẳng nói gì về nguyên nhân.
 *
 * Vá ở đây chứ không sửa mapper, vì mapper còn phục vụ đường nhập JSON và đường lưu
 * tại chỗ; đổi nó là đụng vào hai luồng đang chạy tốt.
 *
 * Dùng chung cho HAI đường: tải job về máy, và mở tab xem job trên cây server. Hai
 * đường đó cùng ăn một payload nên phải vá y hệt nhau — tách bản sao thứ hai là tự
 * chuốc lấy cảnh sửa một chỗ quên chỗ kia.
 */

import { toLocalMrid } from '@/utils/serverId'

/**
 * Nhãn của ô discrete, tra theo TÊN CỘT rồi mới tới giá trị.
 *
 * Server lưu ô discrete bằng SỐ — bảng `discrete_value` bên đó chỉ có cột `value
 * INTEGER`, không có chỗ nào chứa chữ. Nhãn là việc của client, và điều đó đúng:
 * nhãn là cách trình bày, không phải dữ liệu đo.
 *
 * <b>Phải tra theo tên cột, không được tra theo mình con số.</b> Cùng giá trị 1
 * nhưng ở cột `assessment` là "Pass" còn ở `condition_indicator` là "Poor" — hai
 * nghĩa ngược hẳn nhau. Nhầm ở đây thì một kết quả đạt hiện thành thiết bị sắp hỏng.
 *
 * Cùng bảng tra với `assessmentToValue` / `conditionIndicatorToValue` bên
 * `views/JobView/Common`, chỉ chạy ngược chiều.
 */
const DISCRETE_LABELS = {
    assessment: { 1: 'Pass', 0: 'Fail' },
    condition_indicator: { 3: 'Good', 2: 'Fair', 1: 'Poor', 0: 'Bad' },
}

/**
 * Đổi ô discrete từ số sang nhãn, tại chỗ.
 *
 * Bỏ qua nếu giá trị đã là chữ — payload có thể đã đi qua đường khác rồi, và đổi
 * hai lần thì 'Pass' thành rỗng.
 *
 * @param {object} cellHolder một dòng bảng, hoặc khối điều kiện
 */
function labelDiscreteCells(cellHolder) {
    if (!cellHolder || typeof cellHolder !== 'object') return
    for (const key of Object.keys(DISCRETE_LABELS)) {
        const cell = cellHolder[key]
        if (!cell || typeof cell !== 'object' || cell.type !== 'discrete') continue

        const raw = cell.value
        if (raw === null || raw === undefined || raw === '') continue
        if (typeof raw === 'string' && !/^\d+$/.test(raw)) continue   // đã là nhãn

        const label = DISCRETE_LABELS[key][Number(raw)]
        if (label !== undefined) cell.value = label
    }
}

/**
 * @param {object} dto       kết quả `mapServerToDto`, bị sửa TẠI CHỖ
 * @param {string} linkKey   tên khoá bảng nối thiết bị ↔ bài test của loại này; sáu
 *                           mapper đặt sáu tên khác nhau cho cùng một thứ
 * @param {string} assetType nhãn loại thiết bị, vd 'Voltage transformer'. Cần để
 *                           dựng lại `asset_id` ở dạng local — xem ghi chú bên dưới
 * @returns {object} chính `dto`, để gọi lồng cho gọn
 */
export function normalizeJobDto(dto, linkKey, assetType, userId = null) {
    if (!dto) throw new Error('Server returned an empty job payload')

    // ── asset_id: SỐ của server -> CHUỖI dạng local ──────────────────────────
    //
    // Server khai `work.asset_id` kiểu BIGINT nên trả về một con SỐ (4447), còn máy
    // thì lưu mrid thiết bị dạng chuỗi có hậu tố ('4447@vt'). Hai hệ quả, cái sau
    // nặng hơn nhiều:
    //
    //   1. Vue cảnh báo `compareAssetMrid` mong String mà nhận Number.
    //   2. Mọi thứ tra thiết bị theo `asset_id` đều trượt: panel so sánh với các lần
    //      đo trước tìm bằng '4447' trong khi DB lưu '4447@vt' -> luôn ra rỗng. Và ở
    //      đường tải job về, con số trần này được GHI THẲNG vào `old_work.asset_id`,
    //      cắt đứt liên kết giữa job và thiết bị ngay trong DB.
    //
    // Sửa ở đây vì cả hai đường — tải job về máy và mở tab xem trên cây server —
    // đều đi qua hàm này.
    if (dto.properties && assetType) {
        const rawAssetId = dto.properties.asset_id
        if (rawAssetId !== null && rawAssetId !== undefined && rawAssetId !== '') {
            dto.properties.asset_id = toLocalMrid(String(rawAssetId), {
                mode: 'asset',
                asset: assetType
            }, userId)
        } else {
            // Prop khai kiểu String nên null cũng làm Vue kêu. Chuỗi rỗng là giá trị
            // mặc định của chính prop đó.
            dto.properties.asset_id = ''
        }
    }

    // `path` phải là chuỗi JSON '[]', KHÔNG phải mảng rỗng — tầng ghi gọi JSON.parse
    // lên nó để dựng danh sách tệp cần đồng bộ.
    const emptyAttachment = () => ({
        id: null, path: '[]', name: null, type: null, id_foreign: null
    })

    if (!dto.attachment || typeof dto.attachment !== 'object') {
        dto.attachment = emptyAttachment()
    }
    if (!dto.attachment.path) dto.attachment.path = '[]'

    dto.testingEquipmentData = dto.testingEquipmentData || []
    dto.procedureAsset = dto.procedureAsset || []
    dto.testList = dto.testList || []
    if (linkKey) dto[linkKey] = dto[linkKey] || []

    for (const item of dto.testList) {
        if (!item.testCondition || typeof item.testCondition !== 'object') {
            item.testCondition = { mrid: null, comment: null, condition: {} }
        }
        if (!item.testCondition.condition) item.testCondition.condition = {}
        if (!item.testCondition.attachment || typeof item.testCondition.attachment !== 'object') {
            item.testCondition.attachment = { ...emptyAttachment(), id_foreign: item.mrid || null }
        }
        if (!item.testCondition.attachment.path) item.testCondition.attachment.path = '[]'
        if (!item.data || typeof item.data !== 'object') item.data = { table: {} }
        if (!item.data.table) item.data.table = {}

        // Ô đánh giá và ô tình trạng: số của server -> nhãn cho người đọc.
        // Không đổi thì ô "Assessment" trên màn hình hiện 0 và 1 thay vì Fail/Pass,
        // và ô chọn không khớp giá trị nào trong danh sách nên coi như trống.
        labelDiscreteCells(item.testCondition.condition)
        for (const tableName of Object.keys(item.data.table)) {
            const rows = item.data.table[tableName]
            if (!Array.isArray(rows)) continue
            rows.forEach(labelDiscreteCells)
        }
    }

    return dto
}

/**
 * Đắp lại `testTypeName` và `testTypeId` từ danh mục bài test trong config.
 *
 * Bài test trong payload chỉ mang `testTypeCode` (vd `DCWindingPrim`). Màn hình cần
 * cả tên hiển thị và mrid của định nghĩa để dựng form, mà hai thứ đó nằm trong config
 * bundle của client chứ không đi kèm payload.
 *
 * Khớp theo `code` HOẶC `alias_name`: sáu nhánh trong `Tabs.vue` đang dùng lẫn lộn
 * hai trường này tuỳ loại thiết bị, nên nhận cả hai là cách duy nhất chạy đúng cho
 * cả sáu mà không phải nhớ loại nào dùng trường nào.
 *
 * @param {object} dto          payload job
 * @param {Array}  testTypeList danh mục bài test của loại thiết bị này
 */
export function applyTestTypeNames(dto, testTypeList) {
    if (!dto || !Array.isArray(dto.testList) || !Array.isArray(testTypeList)) return
    for (const test of dto.testList) {
        if (!test.testTypeCode) continue
        const found = testTypeList.find(
            t => t.code === test.testTypeCode || t.alias_name === test.testTypeCode
        )
        if (found) {
            test.testTypeName = found.name
            test.testTypeId = found.mrid
        }
    }
}
