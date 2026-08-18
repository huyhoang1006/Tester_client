/**
 * So sánh kết quả test hiện tại với một lần test trước — LOGIC THUẦN.
 *
 * Không đụng DOM, không đụng DB, không import Vue → viết test được.
 *
 * Hai nguồn dữ liệu khác nhau:
 *   - Bản hiện tại: đang nhập dở trong form, nằm trong bộ nhớ (item.data.table)
 *   - Bản tham chiếu: đọc từ DB (function/entity/compareTest)
 * Cả hai được quy về CÙNG một cấu trúc snapshot rồi mới so.
 *
 * snapshot = {
 *   keyCodes: ['measurement', 'test_mode'],
 *   conditions: { [key]: { name, value, unit } },
 *   tables: [ { title, rows: [ { key, label, cells: { [measurementId]: Cell } } ] } ]
 * }
 * Cell = { measurementId, name, aliasName, kind, unit, value, isKey }
 *
 * CỘT MỐC (keyCodes) lấy từ config/compare-keys, KHÔNG suy luận ở đây.
 * Lý do đầy đủ nằm trong file config đó.
 */

const isBlank = (value) => value === null || value === undefined || String(value).trim() === ''

/**
 * Các cột KHÔNG đem đi so.
 *
 * assessment và condition_indicator là KẾT LUẬN do phần mềm tự chấm lại mỗi lần
 * bấm "Assess results", dựa trên bộ tiêu chuẩn đang chọn. Chúng đổi theo tiêu
 * chuẩn chứ không phản ánh tình trạng thiết bị đổi, nên đem so hai lần đo chỉ
 * gây nhiễu. Cái cần nhìn là số đo gốc — số đổi thì kết luận tự đổi theo.
 *
 * Khớp cả condition_indicator_df và condition_indicator_c của mấy bài DF/Cap.
 */
const EXCLUDED_PREFIXES = ['assessment', 'condition_indicator']

export const isExcludedFromCompare = (code) => {
    const name = String(code || '')
    return EXCLUDED_PREFIXES.some(prefix => name === prefix || name.startsWith(prefix + '_'))
}

const toNumber = (value) => {
    if (isBlank(value)) return null
    const num = Number(String(value).trim())
    return isNaN(num) ? null : num
}

const buildDisplayRowLabel = (cells, keyCodes, options = {}) => {
    if (typeof options.rowLabel === 'function') {
        const label = options.rowLabel(cells, keyCodes)
        if (!isBlank(label)) return label
    }
    return buildRowLabel(cells, keyCodes)
}

const buildDisplayTableTitle = (title, options = {}) => {
    const labels = options.tableLabels || {}
    return labels[title] || title
}

/**
 * Chuẩn hoá một mảnh khoá.
 *
 * Chữ  → bỏ hoa/thường và khoảng trắng thừa ('  HV-A ' = 'hv-a').
 * SỐ   → quy về dạng số ('1' = '1.0' = '01' = 1).
 *
 * Phần số là BẮT BUỘC, không phải làm cho đẹp: nhiều cột mốc là SỐ THỨ TỰ lưu ở
 * bảng analog (interrupter, tap, unit_no, trip_coil). Form giữ chuỗi '1' do gán
 * bằng (j + 1).toString(), còn DB lưu REAL nên đọc ra '1.0'. So bằng chuỗi thì
 * '1' ≠ '1.0' → không dòng nào ghép được, cả bảng thành new + removed.
 */
const normalizeKeyPart = (value) => {
    const text = String(value === null || value === undefined ? '' : value).trim()
    if (text === '') return ''
    const num = Number(text)
    return isNaN(num) ? text.toLowerCase() : String(num)
}

/** Bỏ đuôi '.0' thừa khi hiện nhãn dòng, để hai bên nhìn giống nhau */
const displayKeyPart = (value) => {
    const text = String(value === null || value === undefined ? '' : value).trim()
    if (text === '') return ''
    const num = Number(text)
    return isNaN(num) ? text : String(num)
}

/* Ký tự NUL làm dấu ngăn: người dùng không gõ được nó, nên khoá 'A'+'B1'
   không thể trùng với 'AB'+'1' như khi ngăn bằng dấu cách hay gạch nối. */
const KEY_SEPARATOR = '\u0000'

const findCellByCode = (cells, code) => Object.values(cells || {}).find(c => c && c.aliasName === code)

/**
 * Khoá ghép dòng.
 * @returns chuỗi khoá, hoặc '' nếu KHÔNG ghép được (không khai cột mốc, hoặc
 *          mọi ô mốc đều trống — dòng chưa điền thì không đoán bừa nó là dòng nào).
 */
export const buildRowKey = (cells, keyCodes) => {
    if (!keyCodes || !keyCodes.length) return ''
    const parts = keyCodes.map(code => normalizeKeyPart((findCellByCode(cells, code) || {}).value))
    if (parts.every(part => part === '')) return ''
    return parts.join(KEY_SEPARATOR)
}

/** Nhãn hiển thị của dòng: ghép giá trị các cột mốc, vd 'A · 1' */
export const buildRowLabel = (cells, keyCodes) => {
    if (!keyCodes || !keyCodes.length) return ''
    return keyCodes
        .map(code => (findCellByCode(cells, code) || {}).value)
        .filter(value => !isBlank(value))
        .map(displayKeyPart)
        .join(' · ')
}

/**
 * Dựng snapshot từ dữ liệu đang nhập trên form.
 * @param tableData  item.data.table — { table1: [row, ...], ... }
 * @param columns    mảng cột từ test-definitions (có mrid, code, name, unit, type)
 * @param conditions item.testCondition.condition
 * @param keyCodes   mã các cột mốc, lấy từ config/compare-keys
 */
export const buildSnapshotFromForm = (tableData, columns, conditions, keyCodes = [], options = {}) => {
    const columnByCode = {}
    for (const col of (columns || [])) columnByCode[col.code] = col
    const keys = keyCodes || []

    const tables = []
    for (const title of Object.keys(tableData || {})) {
        const rows = tableData[title]
        if (!Array.isArray(rows)) continue

        const outRows = []
        for (const row of rows) {
            const cells = {}
            for (const code of Object.keys(row || {})) {
                const cell = row[code]
                if (!cell || typeof cell !== 'object' || cell.measurement_id === undefined) continue
                const col = columnByCode[code] || {}
                cells[cell.measurement_id] = {
                    measurementId: cell.measurement_id,
                    name: col.name || code,
                    aliasName: code,
                    kind: cell.type || col.type || 'string',
                    unit: cell.unit || col.unit || '',
                    value: cell.value,
                    isKey: keys.includes(code)
                }
            }
            outRows.push({
                key: buildRowKey(cells, keys),
                label: buildDisplayRowLabel(cells, keys, options),
                rawLabel: buildRowLabel(cells, keys),
                cells
            })
        }
        tables.push({ title, displayTitle: buildDisplayTableTitle(title, options), rows: outRows })
    }

    const outConditions = {}
    for (const key of Object.keys(conditions || {})) {
        const cell = conditions[key]
        if (!cell || typeof cell !== 'object') continue
        outConditions[key] = { name: key, value: cell.value, unit: cell.unit || '' }
    }

    return { keyCodes: keys.slice(), conditions: outConditions, tables }
}

/**
 * Gắn mã cột (aliasName), khoá và nhãn cho snapshot đọc từ DB.
 *
 * Ba bảng *_value chỉ lưu (mrid, value, khoá ngoại) — KHÔNG có alias_name, nên tầng
 * DB không biết ô đó ứng với cột `measurement` hay `r60s`. Đối chiếu duy nhất được
 * là measurementId, và ánh xạ measurementId → code nằm ở file test-definitions.
 * Vì vậy phải gắn ở renderer, nơi có sẵn mảng columns.
 */
export const attachAliasFromColumns = (snapshot, columns, keyCodes = [], options = {}) => {
    if (!snapshot) return snapshot
    const codeByMrid = {}
    for (const col of (columns || [])) if (col && col.mrid) codeByMrid[col.mrid] = col.code
    const keys = keyCodes || []
    snapshot.keyCodes = keys.slice()

    for (const table of (snapshot.tables || [])) {
        table.displayTitle = buildDisplayTableTitle(table.title, options)
        for (const row of (table.rows || [])) {
            for (const cellKey of Object.keys(row.cells || {})) {
                const cell = row.cells[cellKey]
                if (!cell.aliasName && codeByMrid[cell.measurementId]) {
                    cell.aliasName = codeByMrid[cell.measurementId]
                }
                cell.isKey = keys.includes(cell.aliasName)
            }
            row.key = buildRowKey(row.cells, keys)
            row.rawLabel = buildRowLabel(row.cells, keys)
            row.label = buildDisplayRowLabel(row.cells, keys, options)
        }
    }
    return snapshot
}

/**
 * Tính Δ cho một cặp ô.
 *
 * QUAN TRỌNG — không quy đổi đơn vị: trong dữ liệu app, tiền tố 'm' KHÔNG nhất quán
 * ('m|Ω' hiển thị là MΩ, còn 'm|s' là ms). Quy đổi theo tiền tố sẽ ra số sai âm thầm.
 * Nên chỉ tính Δ khi đơn vị GIỐNG HỆT nhau, khác thì báo rõ là không so được.
 */
const compareCell = (current, previous) => {
    const kind = (current && current.kind) || (previous && previous.kind) || 'string'
    const currentValue = current ? current.value : null
    const previousValue = previous ? previous.value : null

    const result = {
        kind,
        current: currentValue,
        previous: previousValue,
        delta: null,
        deltaPercent: null,
        changed: false,
        note: ''
    }

    if (isBlank(currentValue) && isBlank(previousValue)) return result

    result.changed = String(currentValue ?? '') !== String(previousValue ?? '')

    if (kind !== 'analog') return result   // discrete / string: chỉ đổi hay không đổi

    const currentUnit = (current && current.unit) || ''
    const previousUnit = (previous && previous.unit) || ''
    if (currentUnit !== previousUnit) {
        result.note = `Different units (${currentUnit || '—'} vs ${previousUnit || '—'})`
        return result
    }

    const a = toNumber(currentValue)
    const b = toNumber(previousValue)
    if (a === null || b === null) return result

    result.delta = a - b
    result.deltaPercent = b !== 0 ? ((a - b) / Math.abs(b)) * 100 : null
    return result
}

/**
 * Ghép dòng.
 *
 * Có cột mốc  → ghép theo GIÁ TRỊ mốc, thứ tự nhập không quan trọng.
 *               Khoá trùng nhau thì ghép lần lượt theo thứ tự xuất hiện.
 *               Khoá rỗng (chưa điền ô mốc) thì không ghép với ai.
 * Không có mốc → bảng một dòng, ghép theo VỊ TRÍ dòng.
 */
const matchRows = (currentRows, referenceRows, hasKey) => {
    const pairs = []

    if (!hasKey) {
        const max = Math.max(currentRows.length, referenceRows.length)
        for (let i = 0; i < max; i += 1) {
            const cur = currentRows[i] || null
            const ref = referenceRows[i] || null
            if (cur && ref) pairs.push({ status: 'matched', current: cur, reference: ref })
            else if (cur) pairs.push({ status: 'onlyCurrent', current: cur, reference: null })
            else pairs.push({ status: 'onlyReference', current: null, reference: ref })
        }
        return pairs
    }

    const remaining = referenceRows.map(row => ({ row, used: false }))
    for (const currentRow of currentRows) {
        const key = currentRow.key
        const hit = key === '' ? null : remaining.find(item => !item.used && item.row.key === key)
        if (hit) {
            hit.used = true
            pairs.push({ status: 'matched', current: currentRow, reference: hit.row })
        } else {
            pairs.push({ status: 'onlyCurrent', current: currentRow, reference: null })
        }
    }
    for (const item of remaining) {
        if (!item.used) pairs.push({ status: 'onlyReference', current: null, reference: item.row })
    }
    return pairs
}

/** Thứ tự cột: giữ theo bản hiện tại, cột chỉ có ở bản cũ thì nối vào sau */
const buildColumns = (currentRows, referenceRows) => {
    const columns = []
    const seen = new Set()
    const push = (cell) => {
        if (!cell || seen.has(cell.measurementId)) return
        seen.add(cell.measurementId)
        columns.push({
            measurementId: cell.measurementId,
            name: cell.name,
            aliasName: cell.aliasName,
            kind: cell.kind,
            unit: cell.unit,
            isKey: !!cell.isKey
        })
    }
    for (const row of currentRows) Object.values(row.cells).forEach(push)
    for (const row of referenceRows) Object.values(row.cells).forEach(push)
    return columns
}

/**
 * So sánh 2 snapshot.
 * @returns { tables: [...], conditionDiff: [...], summary: {...} }
 */
export const compareSnapshots = (current, reference) => {
    const currentTables = (current && current.tables) || []
    const referenceTables = (reference && reference.tables) || []
    const keyCodes = (current && current.keyCodes) || (reference && reference.keyCodes) || []
    const hasKey = keyCodes.length > 0

    const titles = []
    for (const table of currentTables) if (!titles.includes(table.title)) titles.push(table.title)
    for (const table of referenceTables) if (!titles.includes(table.title)) titles.push(table.title)

    const tables = []
    let changedCells = 0
    let comparedCells = 0

    for (const title of titles) {
        const currentTable = currentTables.find(t => t.title === title) || {}
        const referenceTable = referenceTables.find(t => t.title === title) || {}
        const currentRows = currentTable.rows || []
        const referenceRows = referenceTable.rows || []
        const columns = buildColumns(currentRows, referenceRows)
        // Bỏ cột mốc (đã hiện ở cột nhãn bên trái, và hai dòng ghép được thì mốc
        // giống nhau) và bỏ assessment / condition_indicator (xem isExcludedFromCompare).
        const valueColumns = columns.filter(col => !col.isKey && !isExcludedFromCompare(col.aliasName))

        const rows = matchRows(currentRows, referenceRows, hasKey).map((pair, index) => ({
            label: (pair.current && pair.current.label)
                || (pair.reference && pair.reference.label)
                || (hasKey ? '' : `#${index + 1}`),
            status: pair.status,
            cells: valueColumns.map(col => {
                const cell = compareCell(
                    pair.current ? pair.current.cells[col.measurementId] : null,
                    pair.reference ? pair.reference.cells[col.measurementId] : null
                )
                if (pair.status === 'matched') {
                    comparedCells += 1
                    if (cell.changed) changedCells += 1
                }
                return Object.assign({ measurementId: col.measurementId, name: col.name, unit: col.unit }, cell)
            })
        }))

        tables.push({
            title,
            displayTitle: currentTable.displayTitle || referenceTable.displayTitle || title,
            columns: valueColumns,
            rows
        })
    }

    // Điều kiện thí nghiệm: R60s phụ thuộc mạnh vào nhiệt độ nên phải cho người
    // dùng thấy hai lần đo ở điều kiện nào, không tự động quy đổi.
    const conditionKeys = []
    for (const key of Object.keys((current && current.conditions) || {})) conditionKeys.push(key)
    for (const key of Object.keys((reference && reference.conditions) || {})) {
        if (!conditionKeys.includes(key)) conditionKeys.push(key)
    }
    const conditionDiff = conditionKeys.map(key => {
        const cur = ((current && current.conditions) || {})[key] || {}
        const ref = ((reference && reference.conditions) || {})[key] || {}
        return {
            key,
            name: cur.name || ref.name || key,
            unit: cur.unit || ref.unit || '',
            current: cur.value,
            previous: ref.value,
            differs: String(cur.value ?? '') !== String(ref.value ?? '')
        }
    }).filter(item => !isBlank(item.current) || !isBlank(item.previous))

    return {
        tables,
        conditionDiff,
        summary: {
            comparedCells,
            changedCells,
            onlyCurrent: tables.reduce((n, t) => n + t.rows.filter(r => r.status === 'onlyCurrent').length, 0),
            onlyReference: tables.reduce((n, t) => n + t.rows.filter(r => r.status === 'onlyReference').length, 0)
        }
    }
}

/**
 * Mức cảnh báo theo ĐỘ LỚN của phần trăm lệch — không theo dấu.
 *
 * Cố ý không phân biệt tăng/giảm: với tanδ, dòng rò, điện trở tiếp xúc thì tăng
 * là xấu, còn với điện trở cách điện thì giảm mới là xấu. Tô theo dấu sẽ khiến
 * người đọc hiểu ngược ở một nửa số bài test.
 *
 *   |%| < 10          → 'ok'    (xanh lá)
 *   10 <= |%| <= 50   → 'warn'  (vàng)
 *   |%| > 50          → 'bad'   (đỏ)
 */
export const deltaPercentLevel = (deltaPercent) => {
    if (deltaPercent === null || deltaPercent === undefined || isNaN(deltaPercent)) return ''
    const magnitude = Math.abs(deltaPercent)
    if (magnitude < 10) return 'ok'
    if (magnitude <= 50) return 'warn'
    return 'bad'
}

export default {
    isExcludedFromCompare,
    buildRowKey,
    buildRowLabel,
    buildSnapshotFromForm,
    attachAliasFromColumns,
    compareSnapshots,
    deltaPercentLevel
}
