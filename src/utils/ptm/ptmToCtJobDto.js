/* eslint-disable */
import uuid from '@/utils/uuid'
import Attachment from '@/views/Flatten/Attachment'
import TestStandard from '@/views/Cim/TestStandard'
import CurrentTransformerJobDto from '@/views/Dto/Job/CurrentTransformer'
import CurrentTransformerTestMap from '@/config/test-definitions/CurrentTransformer'
import CurrentTransformerConditionMap from '@/config/testing-condition/CurrentTransformer'
import currentTransformerAssessmentMap from '@/config/testing-assessment/CurrentTransformer'
import * as common from '@/views/JobView/Common/index'
import { findTestConfig } from '@/config/ptm-import'

/**
 * PTM → DTO job máy biến dòng.
 *
 * Nhận dữ liệu đã chuẩn hoá từ `readPtmArchive` và dựng đúng cái DTO mà màn hình job CT
 * đang dùng, để dữ liệu import và dữ liệu nhập tay đi chung một đường lưu.
 *
 * ─── mrid ĐỀU SINH MỚI ───────────────────────────────────────────────────────
 *
 * GUID trong file .ptm là của OMICRON, không mang sang. Hệ quả phải nhớ: import cùng một
 * file hai lần sẽ ra hai job. Chống trùng dựa vào đối chiếu asset theo
 * (serial, manufacturer, manufacturer type) ở tầng trên, không dựa vào mrid.
 *
 * ─── BÀI NÀO KHÔNG CÓ TRONG CONFIG THÌ BỎ QUA ───────────────────────────────
 *
 * Bỏ qua nhưng KHÔNG im lặng: mọi bài bị bỏ đều được ghi vào `skipped` kèm lý do, để hộp
 * thoại xem trước nói được cho người dùng biết cái gì sẽ không vào.
 */

const str = (v) => (v === null || v === undefined) ? '' : String(v)

/**
 * Giá trị "CHƯA CHỌN" của OMICRON cho các ô danh sách.
 *
 * PTM không để trống ô enum — nó ghi hẳn chữ 'Empty'. Chép nguyên sang client thì ô hiện
 * chữ "Empty" như thể đã có người chọn.
 *
 * So sánh không phân biệt hoa thường vì bản PTM khác có thể ghi 'empty'.
 */
const isPtmUnset = (value) => str(value).trim().toLowerCase() === 'empty'

/** Số từ PTM sang giá trị ô: rỗng vẫn là rỗng, có số thì nhân hệ số quy đổi. */
const scaled = (measure, factor) => {
    const raw = measure && measure.value
    if (raw === '' || raw === null || raw === undefined) return ''
    const n = Number(raw)
    if (!Number.isFinite(n)) return ''
    const f = (factor === null || factor === undefined) ? 1 : Number(factor)
    // factor 1 thì trả NGUYÊN chuỗi gốc, không đi qua Number → tránh mất chữ số
    // ('0.00020127678659370707' giữ nguyên thay vì thành '0.0002012767865937').
    if (f === 1) return str(raw)
    return str(n * f)
}

/** ISO datetime của PTM → 'YYYY-MM-DD' cho các ô ngày của client. */
const toDate = (value) => {
    const text = str(value).trim()
    if (!text) return ''
    const m = text.match(/^(\d{4}-\d{2}-\d{2})/)
    return m ? m[1] : ''
}

/**
 * Dựng một dòng bảng test từ một phép đo PTM.
 *
 * Mỗi ô là {mrid, value, unit, type, measurement_id}; `measurement_id` lấy từ
 * `test-definitions` — KHÔNG lấy từ config import, để id chỉ có một nơi định nghĩa.
 */
const buildRow = (emptyRow, measurement, config) => {
    const row = JSON.parse(JSON.stringify(emptyRow))
    row.mrid = uuid.newUuid()

    // Tên dòng: ghép các trường theo config, vd '1S1' + '-' + '1S3'
    if (row.name && config.rowName) {
        const parts = (config.rowName.from || [])
            .map(key => str(measurement[key]).trim())
            .filter(Boolean)
        row.name.value = parts.join(config.rowName.join || ' ')
    }

    for (const code of Object.keys(config.columns || {})) {
        const spec = config.columns[code]
        if (!row[code]) continue
        row[code].value = scaled(measurement[spec.from], spec.factor)
    }

    if (config.assessment && row[config.assessment.to || 'assessment']) {
        const cell = row[config.assessment.to || 'assessment']
        const raw = str(measurement[config.assessment.from])
        const mapped = config.assessment.map || {}
        // Giá trị lạ (bản PTM mới thêm trạng thái) → để TRỐNG, không đoán.
        cell.value = Object.prototype.hasOwnProperty.call(mapped, raw) ? mapped[raw] : ''
    }

    ensureCellMrids(row)
    return row
}

/**
 * CẤP mrid CHO MỌI Ô CÓ KIỂU ĐO.
 *
 * `buildEmptyTestRow` / `buildEmptyTestCondition` để `mrid: ''`, và màn hình job sinh mrid
 * khi người dùng nhập. Import không đi qua màn hình đó nên phải tự cấp.
 *
 * Ô nào có `type` là analog/string/discrete thì tầng lưu sẽ dựng một dòng
 * `procedure_dataset_measurement_value` với `measurement_value_id = value.mrid || null`,
 * mà cột đó NOT NULL. Thiếu mrid là:
 *
 *   SQLITE_CONSTRAINT: NOT NULL constraint failed:
 *   procedure_dataset_measurement_value.measurement_value_id
 *
 * Bản đầu tôi chỉ cấp cho ô của BẢNG mà quên ô ĐIỀU KIỆN ĐO — hai khối dựng
 * measurement_value giống hệt nhau nằm cách nhau 140 dòng trong mapper, nên nhìn một khối
 * là tưởng đã xong.
 *
 * Chỉ cấp cho ô CÓ `type`: ô không có kiểu thì tầng lưu không dựng measurement_value nào,
 * cấp mrid cho nó là tạo id không ai dùng.
 */
const ensureCellMrids = (holder) => {
    if (!holder || typeof holder !== 'object') return 0
    let count = 0
    for (const key of Object.keys(holder)) {
        const cell = holder[key]
        if (!cell || typeof cell !== 'object' || !('value' in cell)) continue
        if (!cell.type) continue
        if (!cell.mrid) { cell.mrid = uuid.newUuid(); count++ }
    }
    return count
}

/**
 * Dựng một bài test hoàn chỉnh (dòng + điều kiện + tiêu chuẩn đánh giá).
 *
 * @returns {{ test, curvePoints, kneePoints }}
 *   `curvePoints` là { [rowMrid]: [{mrid, current, voltage}] }
 *   `kneePoints`  là { [rowMrid]: [{mrid, method, voltage, current, isSelected}] }
 */
const buildTest = (ptmTest, testCode, config, jobConditions) => {
    const definition = CurrentTransformerTestMap[testCode]
    const emptyRow = common.buildEmptyTestRow(definition.columns)
    const conditionDef = CurrentTransformerConditionMap[testCode]
    const condition = conditionDef
        ? common.buildEmptyTestCondition(conditionDef.columns)
        : {}
    const assessmentDef = currentTransformerAssessmentMap[testCode]
    const assessment = assessmentDef
        ? common.buildEmptyTestAssessment(assessmentDef.testStandard)
        : []

    const table1 = []
    const curvePoints = {}
    const kneePoints = {}

    for (const measurement of (ptmTest.measurements || [])) {
        const row = buildRow(emptyRow, measurement, config)
        table1.push(row)

        // Điểm knee của CẢ BA tiêu chuẩn.
        //
        // Bảng test chỉ có một cặp ô i_knee/v_knee — đó là tiêu chuẩn OMICRON đang chọn
        // (`KneePointCalculation`). Hai tiêu chuẩn còn lại là số ĐO THẬT trong file, và
        // chúng lệch nhau đáng kể (673 / 499 / 598 V trên chính file mẫu). Không lưu thì
        // import xong là mất, mà mất kiểu này không ai thấy: bảng vẫn có số.
        //
        // `is_selected` đánh dấu đúng tiêu chuẩn đã sinh ra con số trên bảng, để sau này
        // đối chiếu được bảng với đồ thị mà không phải đoán.
        const kneeSpec = config.kneePoints
        if (kneeSpec) {
            const selected = str(measurement[kneeSpec.selectedFrom || 'kneePointCalculation']).trim()
            const list = (measurement[kneeSpec.from] || [])
                .map(k => {
                    const method = str(k[kneeSpec.method]).trim()
                    const v = k[kneeSpec.y]
                    const i = k[kneeSpec.x]
                    return {
                        mrid: uuid.newUuid(),
                        method,
                        voltage: scaled(v, kneeSpec.factor),
                        current: scaled(i, kneeSpec.factor),
                        // So sánh KHÔNG phân biệt hoa thường: file ghi 'IEC' ở một chỗ và
                        // 'Iec' ở chỗ khác thì vẫn phải là cùng một tiêu chuẩn.
                        isSelected: !!method && method.toLowerCase() === selected.toLowerCase(),
                    }
                })
                .filter(k => k.method !== '' && (k.voltage !== '' || k.current !== ''))
            if (list.length > 0) kneePoints[row.mrid] = list
        }

        // Đường cong: chỉ dòng nào thật sự có điểm đo. Bốn tổ hợp tap chưa đo có 0 điểm —
        // không tạo khoá cho chúng, để tầng lưu khỏi xoá-rồi-ghi-lại một mảng rỗng.
        const curveSpec = config.curve
        if (curveSpec) {
            const points = (measurement[curveSpec.from] || [])
                .map(p => ({
                    mrid: uuid.newUuid(),
                    current: str(p[curveSpec.x]),
                    voltage: str(p[curveSpec.y]),
                }))
                .filter(p => p.current !== '' && p.voltage !== '')
            if (points.length > 0) curvePoints[row.mrid] = points
        }
    }

    // Điều kiện đo: PTM để ở cấp JOB, client để ở cấp TEST. Chép xuống từng bài.
    applyConditions(condition, jobConditions)

    // Ô điều kiện cũng cần mrid, đúng như ô của bảng — tầng lưu đối xử với chúng y hệt.
    ensureCellMrids(condition)

    const testMrid = uuid.newUuid()

    // Tiêu chuẩn đánh giá: KHUÔN ĐẦY ĐỦ, cùng lý do với testCondition ở dưới.
    // `mapDtoToEntity` làm `entity.testStandard.push(item.testAssessment.testStandard)`
    // vô điều kiện; thiếu trường này thì `undefined` vào mảng, và ngay dòng sau
    // `entity.testStandard.map(v => v.mrid)` nổ TypeError.
    //
    // `work_task_id` trỏ về chính mrid của bài test — đúng cách màn hình job làm khi lưu
    // (JobView/CurrentTransformer/mixin: testStandard.work_task_id = test.mrid).
    const testStandard = new TestStandard()
    testStandard.mrid = uuid.newUuid()
    testStandard.work_task_id = testMrid

    return {
        test: {
            mrid: testMrid,
            name: definition.testName || testCode,
            testTypeId: definition.testId,
            testTypeCode: testCode,
            testTypeName: definition.testName,
            created_on: toDate(ptmTest.executionDate),
            // KHUÔN ĐẦY ĐỦ, không rút gọn. Bản đầu tôi chỉ để `{ mrid, condition }` và
            // import chết với một thông báo chẳng liên quan gì:
            //
            //   Import failed: SQLITE_ERROR: cannot rollback - no transaction is active
            //
            // Đường đi: mapper job làm `attachmentTest.push(item.testCondition.attachment)`
            // -> đẩy `undefined` vào mảng -> tầng lưu duyệt mảng đó và đọc `attachment.id`
            // -> TypeError, ném TRƯỚC khi kịp BEGIN -> khối catch gọi ROLLBACK trong khi
            // chưa có giao dịch nào -> lỗi của ROLLBACK đè mất lỗi thật.
            //
            // Thiếu một trường trong DTO mà báo lỗi ở tầng SQLite, cách nhau bốn lớp.
            testCondition: {
                mrid: uuid.newUuid(),
                condition,
                comment: '',
                attachment: new Attachment(),
            },
            testAssessment: { testStandard, assessment },
            data: { table: { table1 } },
        },
        curvePoints,
        kneePoints,
    }
}

/**
 * Đổ điều kiện đo từ job PTM vào khối điều kiện của bài test.
 *
 * Ánh xạ để ngay tại đây chứ không đưa vào config: nó là quan hệ giữa HAI CẤU TRÚC
 * (conditions của job PTM ↔ ô điều kiện của client), không phải bảng tra theo bài test.
 */
const applyConditions = (condition, jobConditions) => {
    if (!condition || !jobConditions) return
    const put = (code, value) => {
        if (!condition[code]) return
        if (value === '' || value === undefined || value === null) return
        // 'Empty' là CHỮ MÀ OMICRON GHI KHI CHƯA CHỌN GÌ, không phải một giá trị.
        //
        // File mẫu có weather / reason / unitLocation đều bằng 'Empty'. Chép thẳng thì ô
        // Weather trên màn hình hiện chữ "Empty" — trông như đã nhập, trong khi thật ra
        // chưa ai chọn. Ô chưa chọn phải TRỐNG.
        //
        // Cùng quy ước với ô assessment: config đã ánh xạ 'Empty' -> '' ở đó rồi.
        //
        // Chỉ lọc ở đây, KHÔNG lọc ở tầng đọc: 'Empty' có thể là chữ thật trong một ô ghi
        // chú do người dùng gõ, và tầng đọc thì không biết ô nào là danh sách chọn.
        if (isPtmUnset(value)) return
        condition[code].value = str(value)
    }
    put('weather', jobConditions.weather)
    put('ambient_temp', jobConditions.ambientTemperature && jobConditions.ambientTemperature.value)
    put('reference_temp', jobConditions.ambientTemperature && jobConditions.ambientTemperature.value)
    put('humidity', jobConditions.humidity && jobConditions.humidity.value)
    put('bottom_oil_temp', jobConditions.bottomOilTemperature && jobConditions.bottomOilTemperature.value)
    put('top_oil_temp', jobConditions.topOilTemperature && jobConditions.topOilTemperature.value)
}

/**
 * Điểm vào: PTM → { jobDto, curvePoints, skipped }
 *
 * @param {object} ptm      kết quả của readPtmArchive
 * @param {string} assetMrid mrid của asset trên cây mà job sẽ gắn vào
 */
export const ptmToCtJobDto = (ptm, assetMrid) => {
    const dto = new CurrentTransformerJobDto()
    const skipped = []
    const allCurvePoints = {}
    const allKneePoints = {}

    dto.properties.mrid = uuid.newUuid()
    dto.properties.name = ptm.job.name || 'Imported job'
    dto.properties.creation_date = toDate(ptm.job.creationDate)
    dto.properties.execution_date = toDate(ptm.job.executionDate)
    dto.properties.approval_date = toDate(ptm.job.approvalDate)
    dto.properties.tested_by = ptm.job.tester || ''
    dto.properties.approved_by = ptm.job.approvedBy || ''
    dto.properties.summary = ptm.job.comment || ''
    dto.properties.asset_id = assetMrid || ''

    for (const ptmTest of (ptm.tests || [])) {
        const found = findTestConfig('CurrentTransformer', ptmTest.type)
        if (!found) {
            skipped.push({
                name: ptmTest.name || ptmTest.type,
                type: ptmTest.type,
                reason: 'This test type is not supported yet',
            })
            continue
        }
        if (!CurrentTransformerTestMap[found.testCode]) {
            // Config trỏ tới một mã bài không có trong test-definitions — lỗi cấu hình,
            // không phải lỗi dữ liệu. Nói rõ để người sửa biết tìm ở đâu.
            skipped.push({
                name: ptmTest.name || ptmTest.type,
                type: ptmTest.type,
                reason: `Config maps to "${found.testCode}" but no such test definition exists`,
            })
            continue
        }

        const built = buildTest(ptmTest, found.testCode, found.config, ptm.job.conditions)
        dto.testList.push(built.test)
        Object.assign(allCurvePoints, built.curvePoints)
        Object.assign(allKneePoints, built.kneePoints)
    }

    // Bài PTM mà tầng đọc không hiểu (khác với bài đọc được nhưng chưa ánh xạ).
    for (const un of (ptm.unsupportedTests || [])) {
        skipped.push({
            name: un.name || un.type,
            type: un.type,
            reason: 'This test type is not supported yet',
        })
    }

    return { jobDto: dto, curvePoints: allCurvePoints, kneePoints: allKneePoints, skipped }
}

export default { ptmToCtJobDto }
