/* eslint-disable */
/**
 * Quy đổi điện trở cuộn dây về nhiệt độ tham chiếu — đặc tả mục 5.2.3.2.
 *
 *   Rcorr = Rmeas × (K + Tref) / (K + Tmeas)
 *   K = 235 với Copper, 225 với Aluminum (theo Conductor material của cuộn dây)
 *
 *   Dev with R ref (%)    = 100 × (Rcorr − Rref) / Rref
 *   Dev within phases (%) = 100 × (max Rcorr − min Rcorr) / min Rcorr
 *
 * Đặc tả yêu cầu so sánh theo trị tuyệt đối nên giá trị Dev lưu dạng |…|
 * (giữ như cũ — bước Assess và Condition indicator đều so với ngưỡng dương).
 *
 * Thiếu Winding temp hoặc Ref temp → KHÔNG có Rcorr, kéo theo không có Dev.
 */

// Bài test → khoá cuộn dây trong assetData.others.winding
export const DC_WINDING_TESTS = {
    DCWindingPrim: 'prim',
    DCWindingSec: 'sec',
    DCWindingTert: 'tert'
}

export const isDcWindingTest = (testCode) => Object.prototype.hasOwnProperty.call(DC_WINDING_TESTS, testCode)

export const DEFAULT_REFERENCE_TEMP = 75

export const NO_WINDING_TEMP_WARNING = 'No winding temperature available, unable to calculate the corrected temperature'

export const CONDITION_HINTS = {
    winding_temp: 'Actual winding temperature at testing time (°C).\nRequired along with Reference Temp to calculate the corrected resistance (Rcorr).',
    reference_temp: 'Reference temperature for standardization (°C, typically 75°C).\nRequired along with Winding Temp to calculate the corrected resistance (Rcorr).'
}

export const RCORR_HINT = 'Temperature-corrected resistance: Rcorr = Rmeas × (K + Tref) / (K + Tmeas).\nCan be calculated when both Winding Temp & Ref Temp are provided.'

/** Số hợp lệ hoặc null. Chấp nhận 0 (0 °C là nhiệt độ hợp lệ). */
export const toNumberOrNull = (value) => {
    if (value === null || value === undefined) return null
    const text = String(value).trim().replace(',', '.')
    if (text === '') return null
    const n = Number(text)
    return isFinite(n) ? n : null
}

const round = (value, digits) => {
    const f = Math.pow(10, digits)
    return Math.round(value * f) / f
}

/** Vật liệu dây dẫn của cuộn dây ứng với bài test; DTO mặc định là Copper. */
export const conductorMaterialOf = (assetData, testCode) => {
    const windingKey = DC_WINDING_TESTS[testCode]
    const winding = assetData && assetData.others && assetData.others.winding
    const material = winding && windingKey ? winding[windingKey] : ''
    return material || 'Copper'
}

export const conductorConstant = (material) => {
    const text = String(material || '').trim().toLowerCase()
    return (text === 'aluminum' || text === 'aluminium' || text === 'al') ? 225 : 235
}

/** Rcorr hoặc null nếu thiếu dữ liệu / mẫu số bằng 0. */
export const correctResistance = (rMeas, tMeas, tRef, K) => {
    const r = toNumberOrNull(rMeas)
    const tm = toNumberOrNull(tMeas)
    const tr = toNumberOrNull(tRef)
    if (r === null || tm === null || tr === null) return null
    if (K + tm === 0) return null
    return r * (K + tr) / (K + tm)
}

export const devWithReference = (rCorr, rRef) => {
    const c = toNumberOrNull(rCorr)
    const ref = toNumberOrNull(rRef)
    if (c === null || ref === null || ref === 0) return null
    return Math.abs(100 * (c - ref) / ref)
}

export const devWithinPhases = (rCorrValues) => {
    const values = (rCorrValues || []).map(toNumberOrNull)
    if (!values.length || values.some(v => v === null)) return null
    const maxV = Math.max.apply(null, values)
    const minV = Math.min.apply(null, values)
    if (minV === 0) return null
    return Math.abs(100 * (maxV - minV) / minV)
}

export const formatRcorr = (value) => (value === null ? '' : String(round(value, 6)))
export const formatDev = (value) => (value === null ? '' : String(round(value, 4)))

/**
 * Tính lại R corr / Dev with R ref / Dev within phases cho bảng nhập liệu.
 * rows: testData.table.table1 — mỗi nhóm 3 dòng (3 pha) chung một ô dev_phase (rowspan=3).
 */
export const computeDcWindingRows = (rows, { tMeas, tRef, K }) => {
    if (!Array.isArray(rows)) return
    for (const row of rows) {
        if (!row) continue
        const rCorr = correctResistance(row.r_meas && row.r_meas.value, tMeas, tRef, K)
        if (row.r_corr) row.r_corr.value = formatRcorr(rCorr)
        if (row.dev_r_ref) row.dev_r_ref.value = formatDev(devWithReference(rCorr, row.r_ref && row.r_ref.value))
    }
    for (let g = 0; g < rows.length; g += 3) {
        const group = rows.slice(g, g + 3)
        const dev = devWithinPhases(group.map(r => r && r.r_corr ? r.r_corr.value : null))
        if (rows[g] && rows[g].dev_phase) rows[g].dev_phase.value = formatDev(dev)
    }
}

/**
 * Tìm giá trị một điều kiện thí nghiệm trong snapshot.
 * Snapshot của form khoá theo code ('winding_temp'), snapshot đọc từ DB khoá theo
 * TÊN measurement ('Winding temperature') — nên dò cả hai.
 */
export const findConditionValue = (conditions, code, name) => {
    if (!conditions) return null
    const normalize = (text) => String(text || '').trim().toLowerCase().replace(/[\s_]+/g, ' ')
    const wanted = [normalize(code), normalize(name)]
    for (const key of Object.keys(conditions)) {
        const cell = conditions[key] || {}
        if (wanted.includes(normalize(key)) || wanted.includes(normalize(cell.name))) {
            return toNumberOrNull(cell.value)
        }
    }
    return null
}

const findCell = (cells, code) => Object.values(cells || {}).find(c => c && c.aliasName === code)

/**
 * Bảng so sánh: tính lại R corr + Dev with R ref của MỘT snapshot theo Ref Temp
 * người dùng chọn, dùng winding temp của chính lần test đó.
 * Dev within phases không phụ thuộc Tref (cả 3 pha nhân cùng hệ số) nên giữ nguyên.
 * Trả về true nếu snapshot có winding temp.
 */
export const recalcSnapshotRcorr = (snapshot, { tMeas, tRef, K }) => {
    if (!snapshot) return false
    for (const table of (snapshot.tables || [])) {
        for (const row of (table.rows || [])) {
            const cells = row.cells || {}
            const rCorrCell = findCell(cells, 'r_corr')
            if (!rCorrCell) continue
            const rMeasCell = findCell(cells, 'r_meas')
            const rRefCell = findCell(cells, 'r_ref')
            const devCell = findCell(cells, 'dev_r_ref')
            const rCorr = correctResistance(rMeasCell ? rMeasCell.value : null, tMeas, tRef, K)
            rCorrCell.value = formatRcorr(rCorr)
            if (devCell) devCell.value = formatDev(devWithReference(rCorr, rRefCell ? rRefCell.value : null))
        }
    }
    return tMeas !== null && tMeas !== undefined
}
