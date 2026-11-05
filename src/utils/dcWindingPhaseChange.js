/* eslint-disable */
/**
 * Asset máy biến áp đổi cấu hình pha (vd 1 pha A → 1 pha B, 3 pha → 1 pha B) mà các
 * bài DC Winding Res Prim/Sec/Tert đã có kết quả ở pha bị bỏ → xử lý trên DTO của job:
 *   move    – 1 pha → 1 pha: chuyển kết quả sang pha mới
 *             3 pha → 1 pha: giữ kết quả của pha mới, bỏ các dòng pha khác
 *   keep    – không đụng gì
 *   delete  – xoá hẳn bài test DC Winding đó khỏi job
 */
import {
    ALL_PHASES, rowHasResults, rebuildRowsForPhases, moveRowsToPhase
} from './transformerPhases'

export const DC_WINDING_TEST_CODES = ['DCWindingPrim', 'DCWindingSec', 'DCWindingTert']
export const DC_WINDING_TEST_LABELS = {
    DCWindingPrim: 'DC Winding Res Prim',
    DCWindingSec: 'DC Winding Res Sec',
    DCWindingTert: 'DC Winding Res Tert'
}

const cellValue = (cell) => (cell && typeof cell === 'object' ? cell.value : cell)
const phaseOf = (row) => String(cellValue(row && row.name) || '').trim().toUpperCase()

/** Pha theo cấu hình winding; chưa khai báo số pha → [] (không xét) */
export const phasesOfConfig = (wc) => {
    const phases = String((wc && wc.phases) || '').trim()
    if (phases === '3') return ALL_PHASES.slice()
    if (phases === '1') {
        const phase = String((wc && wc.phase) || '').trim().toUpperCase()
        return ALL_PHASES.includes(phase) ? [phase] : []
    }
    return []
}

/** Pha có trong cấu hình cũ mà không còn trong cấu hình mới */
export const removedPhases = (oldWc, newWc) => {
    const before = phasesOfConfig(oldWc)
    const after = phasesOfConfig(newWc)
    if (!before.length || !after.length) return []
    return before.filter(phase => !after.includes(phase))
}

const rowsOf = (test) => (test && test.data && test.data.table && Array.isArray(test.data.table.table1)
    ? test.data.table.table1
    : [])

/** Các bài DC Winding trong job có dòng mang pha bị bỏ (chỉ xét pha) */
export const affectedTests = (jobDto, removed) => {
    return ((jobDto && jobDto.testList) || []).filter(test => {
        if (!DC_WINDING_TEST_CODES.includes(test.testTypeCode)) return false
        return rowsOf(test).some(row => removed.includes(phaseOf(row)))
    })
}

/**
 * Sửa DTO job theo lựa chọn. rowTemplateOf(testCode) trả dòng trống của bài test.
 * @returns số bài test đã thay đổi
 */
export const applyPhaseChangeToJob = (jobDto, { mode, removed, newPhases, rowTemplateOf }) => {
    const tests = affectedTests(jobDto, removed)
    if (!tests.length || mode === 'keep') return 0
    if (mode === 'delete') {
        const ids = new Set(tests.map(test => test.mrid))
        jobDto.testList = jobDto.testList.filter(test => !ids.has(test.mrid))
        return tests.length
    }
    // move
    for (const test of tests) {
        const rows = rowsOf(test)
        if (newPhases.length !== 1) {
            test.data.table.table1 = rebuildRowsForPhases(rows, newPhases, rowTemplateOf(test.testTypeCode), true)
            continue
        }
        // Máy mới 1 pha P: mỗi nấc còn đúng 1 dòng pha P.
        //  - dòng pha P đã có kết quả → giữ
        //  - không thì lấy dòng của pha cũ (chỉ khi pha cũ là 1 pha) → chuyển sang P
        //  - không có gì → dòng trống
        const target = newPhases[0]
        const singleOld = removed.length === 1 ? removed[0] : null
        const taps = []
        for (const row of rows) {
            const tap = cellValue(row && row.tap)
            if (!taps.some(t => String(t) === String(tap))) taps.push(tap)
        }
        const out = []
        for (const tap of taps) {
            const atTap = rows.filter(row => String(cellValue(row && row.tap)) === String(tap))
            const own = atTap.find(row => phaseOf(row) === target)
            // Chuyển nguyên dòng của pha cũ sang pha mới (xét theo pha, không cần số đo)
            const moved = singleOld ? atTap.find(row => phaseOf(row) === singleOld) : null
            let row = own && rowHasResults(own) ? own : (moved || own)
            if (!row) {
                row = JSON.parse(JSON.stringify(rowTemplateOf(test.testTypeCode)))
                if (row.tap && tap !== undefined) row.tap.value = tap
            }
            moveRowsToPhase([row], target)
            out.push(row)
        }
        test.data.table.table1 = out
    }
    return tests.length
}
