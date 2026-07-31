import db from '../../datacontext/index'

/**
 * So sánh kết quả test với lần test trước — tầng đọc dữ liệu (main process).
 *
 * Chỉ ĐỌC, không ghi gì. Nguồn dữ liệu hoàn toàn là DB local.
 *
 * Đường đi dữ liệu của một bài test đã lưu:
 *   old_work (asset_id)  →  work_task (work)  →  document.type = mã bài test
 *   work_task            →  procedure_dataset (work_task)   = từng DÒNG của bảng
 *   procedure_dataset    →  procedure_dataset_measurement_value  →  *_value = từng Ô
 *
 * Lưu ý: analog_value/string_measurement_value/discrete_value trong DB client KHÔNG
 * có cột procedure_dataset_id, phải đi qua bảng nối procedure_dataset_measurement_value.
 */

const all = (sql, params = []) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => err ? reject(err) : resolve(rows || []))
})

/** 'MM/dd/yyyy' → timestamp để sắp xếp; không parse được thì trả 0 */
const parseDate = (value) => {
    if (!value) return 0
    const text = String(value).trim()
    const slash = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
    if (slash) return new Date(`${slash[3]}-${slash[1].padStart(2, '0')}-${slash[2].padStart(2, '0')}`).getTime() || 0
    const parsed = Date.parse(text)
    return isNaN(parsed) ? 0 : parsed
}

/**
 * Danh sách các lần test CÙNG BÀI TEST trên CÙNG THIẾT BỊ, trừ job đang mở.
 * @param assetMrid      mrid thiết bị
 * @param testCode       mã bài test (document.type của work_task, vd 'InsulationResistance')
 * @param excludeWorkMrid job hiện tại, loại khỏi danh sách
 */
export const getComparableTests = async (assetMrid, testCode, excludeWorkMrid) => {
    try {
        if (!assetMrid || !testCode) {
            return { success: true, data: [], message: 'Missing assetMrid or testCode' }
        }

        const rows = await all(
            `SELECT ow.mrid           AS workMrid,
                    ow.execution_date AS executionDate,
                    ow.tested_by      AS testedBy,
                    io_w.name         AS workName,
                    d_w.type          AS jobType,
                    wt.mrid           AS workTaskMrid,
                    io_t.name         AS testName
             FROM old_work ow
             JOIN work_task wt        ON wt.work  = ow.mrid
             JOIN document  d_t       ON d_t.mrid = wt.mrid
             LEFT JOIN identified_object io_w ON io_w.mrid = ow.mrid
             LEFT JOIN identified_object io_t ON io_t.mrid = wt.mrid
             LEFT JOIN document d_w   ON d_w.mrid = ow.mrid
             WHERE ow.asset_id = ?
               AND d_t.type    = ?
               AND ow.mrid <> COALESCE(?, '')`,
            [assetMrid, testCode, excludeWorkMrid || '']
        )

        // Chặn lần hai ở tầng dữ liệu: job đang mở tuyệt đối không được lọt vào
        // danh sách tham chiếu, kể cả khi bên gọi truyền thiếu excludeWorkMrid.
        const filtered = excludeWorkMrid
            ? rows.filter(row => String(row.workMrid) !== String(excludeWorkMrid))
            : rows

        // execution_date lưu dạng chuỗi MM/dd/yyyy nên phải sắp bằng JS, không sắp bằng SQL
        filtered.sort((a, b) => parseDate(b.executionDate) - parseDate(a.executionDate))

        return { success: true, data: filtered, message: 'Get comparable tests completed' }
    } catch (error) {
        console.error('getComparableTests failed:', error)
        return { success: false, data: [], message: error.message || 'Get comparable tests failed' }
    }
}

/** Nạp toàn bộ định nghĩa cột (measurement) 1 lần để tra nhanh */
const loadMeasurementMap = async () => {
    const rows = await all(
        `SELECT m.mrid, io.name, m.unit_multiplier, m.unit_symbol
         FROM measurement m LEFT JOIN identified_object io ON io.mrid = m.mrid`
    )
    const map = {}
    for (const row of rows) {
        map[row.mrid] = {
            name: row.name || '',
            unit: [row.unit_multiplier, row.unit_symbol].filter(Boolean).join('|')
        }
    }
    return map
}

/**
 * Đọc các ô của 1 dataset.
 *
 * CẨN THẬN: ba bảng *_value chỉ có đúng (mrid, value, <khoá ngoại>). Chúng KHÔNG có
 * alias_name / vta_alias_name — mấy field đó chỉ tồn tại trên DTO phía renderer,
 * câu INSERT không ghi xuống. Tên cột phải lấy từ identified_object của measurement,
 * còn nhãn của discrete phải join qua value_to_alias.
 */
const getDatasetCells = async (datasetMrid) => {
    return all(
        `SELECT 'analog' AS kind, av.analog AS measurementId,
                CAST(av.value AS TEXT) AS value, NULL AS displayValue
         FROM procedure_dataset_measurement_value j
         JOIN analog_value av ON av.mrid = j.measurement_value_id
         WHERE j.procedure_dataset_id = ?
         UNION ALL
         SELECT 'string', sv.string_measurement, sv.value, NULL
         FROM procedure_dataset_measurement_value j
         JOIN string_measurement_value sv ON sv.mrid = j.measurement_value_id
         WHERE j.procedure_dataset_id = ?
         UNION ALL
         SELECT 'discrete', dv.discrete, CAST(dv.value AS TEXT), io_v.alias_name
         FROM procedure_dataset_measurement_value j
         JOIN discrete_value dv ON dv.mrid = j.measurement_value_id
         LEFT JOIN discrete d ON d.mrid = dv.discrete
         LEFT JOIN value_to_alias vta
                ON vta.value_alias_set = d.value_alias_set AND vta.value = dv.value
         LEFT JOIN identified_object io_v ON io_v.mrid = vta.mrid
         WHERE j.procedure_dataset_id = ?`,
        [datasetMrid, datasetMrid, datasetMrid]
    )
}

/**
 * Dựng "ảnh chụp" của một lần test đã lưu, theo đúng cấu trúc mà tầng so sánh cần.
 * @returns { conditions: {...}, tables: [ { title, rows: [ { label, cells: {...} } ] } ] }
 */
export const getTestSnapshot = async (workTaskMrid) => {
    try {
        if (!workTaskMrid) return { success: false, data: null, message: 'Missing workTaskMrid' }

        const measurementMap = await loadMeasurementMap()

        const datasets = await all(
            `SELECT pd.mrid, d.title, d.type
             FROM procedure_dataset pd
             LEFT JOIN document d ON d.mrid = pd.mrid
             WHERE pd.work_task = ?`,
            [workTaskMrid]
        )

        const tablesByTitle = {}
        const conditions = {}

        for (const dataset of datasets) {
            const cells = await getDatasetCells(dataset.mrid)

            if (dataset.type === 'condition') {
                // Điều kiện thí nghiệm: mỗi ô là 1 chỉ số môi trường.
                // Khoá theo TÊN measurement vì bảng *_value không lưu alias_name.
                for (const cell of cells) {
                    const info = measurementMap[cell.measurementId] || {}
                    conditions[info.name || cell.measurementId] = {
                        name: info.name || '',
                        value: cell.displayValue != null ? cell.displayValue : cell.value,
                        unit: info.unit || ''
                    }
                }
                continue
            }

            const title = dataset.title || 'table1'
            if (!tablesByTitle[title]) tablesByTitle[title] = { title, rows: [] }

            const row = { datasetMrid: dataset.mrid, label: '', cells: {} }
            for (const cell of cells) {
                const info = measurementMap[cell.measurementId] || {}
                row.cells[cell.measurementId] = {
                    measurementId: cell.measurementId,
                    name: info.name || '',
                    // aliasName để renderer gắn sau, dựa vào file test-definitions —
                    // DB không lưu mã cột nên chỉ có measurementId là đối chiếu được.
                    aliasName: '',
                    kind: cell.kind,
                    unit: info.unit || '',
                    // discrete lưu số, nhãn hiển thị lấy từ value_to_alias
                    value: cell.kind === 'discrete' && cell.displayValue != null
                        ? cell.displayValue
                        : cell.value
                }
            }

            // Nhãn dòng: ô string đầu tiên. Renderer sẽ tinh chỉnh lại theo định nghĩa cột.
            const labelCell = Object.values(row.cells).find(c => c.kind === 'string')
            row.label = labelCell ? String(labelCell.value || '') : ''

            tablesByTitle[title].rows.push(row)
        }

        return {
            success: true,
            data: { conditions, tables: Object.values(tablesByTitle) },
            message: 'Get test snapshot completed'
        }
    } catch (error) {
        console.error('getTestSnapshot failed:', error)
        return { success: false, data: null, message: error.message || 'Get test snapshot failed' }
    }
}
