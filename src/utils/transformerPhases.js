/* eslint-disable */
/**
 * Pha của máy biến áp theo khai báo asset (Winding configuration):
 *  - 3 pha → ['A', 'B', 'C']
 *  - 1 pha → [pha đã chọn], chưa chọn pha thì [''] (user tự chọn trên dòng)
 */
export const ALL_PHASES = ['A', 'B', 'C']

export const transformerPhases = (assetData) => {
    const wc = (assetData && assetData.winding_configuration) || {}
    if (String(wc.phases || '').trim() !== '1') return ALL_PHASES.slice()
    const phase = String(wc.phase || '').trim().toUpperCase()
    return [ALL_PHASES.includes(phase) ? phase : '']
}

export const isSinglePhase = (assetData) => transformerPhases(assetData).length === 1

const cellValue = (cell) => (cell && typeof cell === 'object' ? cell.value : cell)
const isBlank = (value) => value === null || value === undefined || String(value).trim() === ''

/** Dòng đã có kết quả đo (bất kỳ ô nhập nào ngoài tap / pha) */
export const rowHasResults = (row, inputKeys = ['r_meas', 'r_ref']) => {
    return inputKeys.some(key => !isBlank(cellValue(row && row[key])))
}

const phaseOf = (row) => String(cellValue(row && row.name) || '').trim().toUpperCase()
const tapOf = (row) => cellValue(row && row.tap)

/** Danh sách nấc theo thứ tự xuất hiện; bảng không có nấc → [undefined] */
export const tapsOf = (rows) => {
    const taps = []
    for (const row of rows || []) {
        const tap = tapOf(row)
        if (!taps.some(t => String(t) === String(tap))) taps.push(tap)
    }
    return taps.length ? taps : [undefined]
}

/**
 * So pha của các dòng kết quả với pha của asset.
 * @returns null nếu khớp, ngược lại { rowPhases, expected, hasResults, oldPhase, newPhase, singleSwitch }
 */
export const detectPhaseMismatch = (rows, expectedPhases, inputKeys) => {
    if (!Array.isArray(rows) || !rows.length) return null
    const expected = expectedPhases.filter(Boolean)
    const rowPhases = [...new Set(rows.map(phaseOf).filter(Boolean))]
    if (!expected.length) {
        // 1 pha nhưng asset chưa chọn pha: chỉ cần thừa dòng (3 pha cũ) mới là lệch
        if (rows.length === tapsOf(rows).length) return null
    } else {
        const same = rowPhases.length === expected.length && expected.every(p => rowPhases.includes(p))
        // Mỗi nấc phải đủ số dòng = số pha
        const shapeOk = rows.length === tapsOf(rows).length * expected.length
        if (same && shapeOk) return null
    }
    const hasResults = rows.some(row => rowHasResults(row, inputKeys))
    const singleSwitch = rowPhases.length === 1 && expected.length === 1 && rowPhases[0] !== expected[0]
    return {
        rowPhases,
        expected,
        hasResults,
        singleSwitch,
        oldPhase: rowPhases.join(', '),
        newPhase: expected.join(', ') || '(not selected)'
    }
}

/**
 * Dựng lại bảng theo pha của asset, giữ nguyên các nấc.
 * keepMatching = true → dòng cũ cùng nấc + cùng pha được giữ nguyên kết quả.
 */
export const rebuildRowsForPhases = (rows, expectedPhases, rowTemplate, keepMatching) => {
    const taps = tapsOf(rows)
    const out = []
    for (const tap of taps) {
        for (const phase of expectedPhases) {
            const existing = keepMatching
                ? (rows || []).find(row => String(tapOf(row)) === String(tap) && phaseOf(row) === phase)
                : null
            if (existing) {
                out.push(existing)
                continue
            }
            const row = JSON.parse(JSON.stringify(rowTemplate))
            if (row.tap && tap !== undefined) row.tap.value = tap
            if (row.name) row.name.value = phase
            out.push(row)
        }
    }
    return out
}

/** Chuyển nguyên kết quả sang pha mới (máy 1 pha đổi từ pha này sang pha khác) */
export const moveRowsToPhase = (rows, newPhase) => {
    for (const row of rows || []) {
        if (row && row.name && typeof row.name === 'object') row.name.value = newPhase
    }
}
