/**
 * CHỌN ĐẦU CỰC BẰNG HAI DROPDOWN — phần dùng chung cho mọi loại thiết bị.
 *
 * Máy biến áp đã làm trước và có bộ riêng (`Transformer/.../terminalUtils.js`). File này
 * là bản khái quát cho bốn loại còn lại: máy biến dòng, máy biến điện áp, chống sét van,
 * cáp lực.
 *
 * ─── HAI DẠNG LƯU, VÌ ĐỊNH NGHĨA BÀI TEST KHÁC NHAU ─────────────────────────
 *
 *   Máy biến áp : hai cột — `measurement` giữ vế trái, `type` giữ vế phải
 *   Bốn loại kia: MỘT cột — `measurement` giữ cả hai vế: 'Prim - (Sec + GND)'
 *
 * Đã đối chiếu file định nghĩa: chỉ Transformer/InsulationResistance.json có cột `type`.
 * Bốn loại kia không có.
 *
 * KHÔNG thêm cột `type` cho bốn loại kia. Định nghĩa bài test là config dùng chung, mang
 * theo mrid của từng cột và đã có trong CSDL của mọi máy; thêm cột là đổi cấu hình chung.
 * Mã hoá vào một cột cũng giữ nguyên được dữ liệu cũ: chuỗi mặc định đang lưu vốn đã đúng
 * khuôn 'Prim - (Sec + GND)'.
 *
 * ─── VÌ SAO VẾ PHẢI ĐƯỢC BỌC NGOẶC ──────────────────────────────────────────
 *
 * 'Prim + Sec - GND' đọc lên rất dễ hiểu nhầm là phép trừ. Dạng đang lưu sẵn trong dữ liệu
 * là 'Prim - (Sec + GND)', nên giữ đúng khuôn đó: một vế nhiều đầu cực thì bọc ngoặc.
 * Đây cũng là cách kỹ thuật viên viết trên biên bản.
 */

/** Bí danh cho tên cũ, để dữ liệu đã lưu vẫn đọc được. */
export const COMMON_ALIASES = {
    HV: 'Prim', PRIM: 'Prim', PRIMARY: 'Prim',
    LV: 'Sec', SEC: 'Sec', SECONDARY: 'Sec',
    TV: 'Tert', TERT: 'Tert', TERTIARY: 'Tert',
    GND: 'GND', E: 'GND', EARTH: 'GND', GROUND: 'GND',
    // Chống sét van và cáp lực đang lưu 'Phase A', 'Phase B'… Bỏ chữ 'Phase' đứng đầu để
    // khớp với A/B/C. Không có dòng này thì mở bài test cũ lên là mất sạch vế trái.
    'PHASE A': 'A', 'PHASE B': 'B', 'PHASE C': 'C', PHASE: '',
}

const str = (v) => (v === null || v === undefined) ? '' : String(v)

/**
 * Tách một vế thành danh sách đầu cực.
 *
 * @param {string|Array} value      'Sec + GND' hoặc '(Sec + GND)' hoặc mảng sẵn
 * @param {Array}  terminals        danh sách hợp lệ, quyết định cả THỨ TỰ hiển thị
 * @param {object} aliases          bảng tên cũ -> tên mới
 */
export const parseSide = (value, terminals, aliases = COMMON_ALIASES) => {
    const rawValues = Array.isArray(value)
        ? value
        : str(value).replace(/[()]/g, '').split(/\s*\+\s*|\s*,\s*/)

    // Khớp KHÔNG phân biệt hoa thường, nhưng trả về đúng chữ trong `terminals` —
    // tên cuộn dây của máy biến điện áp do người dùng đặt, '1A1N' và '1a1n' là một.
    const byUpper = {}
    for (const t of terminals) byUpper[str(t).trim().toUpperCase()] = t

    const found = []
    const unknown = []
    for (const item of rawValues) {
        const raw = str(item).trim()
        const key = raw.toUpperCase()
        if (!key) continue
        const direct = byUpper[key]
        const alias = aliases[key]
        const viaAlias = alias && terminals.includes(alias) ? alias : null
        const hit = direct || viaAlias
        if (hit) {
            if (!found.includes(hit)) found.push(hit)
        } else if (alias === '') {
            // Bí danh trỏ tới chuỗi rỗng nghĩa là "bỏ hẳn từ này" — ví dụ chữ 'Phase'
            // đứng một mình trong 'Phase - GND'.
        } else if (!unknown.includes(raw)) {
            // GIỮ NGUYÊN từ không nhận ra, KHÔNG vứt đi.
            //
            // Dữ liệu cũ có những vế không nằm trong danh sách mới — bài test máy biến dòng
            // đang lưu tên tap thật ('1S1-1S3'), trong khi danh sách mới chỉ có
            // Prim/Sec/GND/Core N Sec. Vứt đi thì vừa mở bài test cũ lên là mất dữ liệu đo,
            // mà người dùng không hề bấm gì.
            //
            // Giữ lại thì nó vẫn hiện, người dùng tự quyết định thay hay để nguyên.
            unknown.push(raw)
        }
    }
    // Từ nhận ra: sắp theo thứ tự trong `terminals` để hai dòng cùng nội dung luôn hiện
    // giống nhau. Từ lạ: giữ nguyên thứ tự gốc, xếp sau.
    return [...terminals.filter(t => found.includes(t)), ...unknown]
}

/**
 * Đọc hai vế từ một dòng.
 *
 * @param {object} row
 * @param {Array}  terminals
 * @param {object} options { twoColumn: false }
 */
export const readSides = (row, terminals, options = {}) => {
    const aliases = options.aliases || COMMON_ALIASES
    if (!row) return { terminal1: [], terminal2: [] }

    if (options.twoColumn) {
        const left = parseSide(row.measurement ? row.measurement.value : '', terminals, aliases)
        const right = parseSide(row.type ? row.type.value : '', terminals, aliases)
            .filter(t => !left.includes(t))
        return { terminal1: left, terminal2: right }
    }

    const text = str(row.measurement ? row.measurement.value : '')
    // Dấu phân cách là ' - ' CÓ KHOẢNG TRẮNG hai bên. Không thể tách bằng '-' trơn: tên
    // cuộn dây và tên tap hoàn toàn có thể chứa dấu nối, ví dụ '1S1-1S3'.
    const at = text.indexOf(' - ')
    if (at < 0) {
        return { terminal1: parseSide(text, terminals, aliases), terminal2: [] }
    }
    const left = parseSide(text.slice(0, at), terminals, aliases)
    const right = parseSide(text.slice(at + 3), terminals, aliases).filter(t => !left.includes(t))
    return { terminal1: left, terminal2: right }
}

/** Ghi hai vế trở lại dòng. Vế phải luôn bị loại những đầu cực đã có ở vế trái. */
export const writeSides = (row, terminal1, terminal2, terminals, options = {}) => {
    if (!row) return row
    // Sắp theo `terminals`, nhưng GIỮ những giá trị lạ (dữ liệu cũ) ở cuối thay vì bỏ.
    const order = (list) => {
        const picked = list || []
        const known = terminals.filter(t => picked.includes(t))
        const extra = picked.filter(t => !terminals.includes(t))
        return [...known, ...extra]
    }
    const left = order(terminal1)
    const right = order(terminal2).filter(t => !left.includes(t))

    if (options.twoColumn) {
        if (row.measurement) row.measurement.value = left.join(' + ')
        if (row.type) row.type.value = right.join(' + ')
        return row
    }

    if (!row.measurement) return row
    const wrap = (list) => list.length > 1 ? `(${list.join(' + ')})` : list.join(' + ')
    if (left.length === 0 && right.length === 0) {
        row.measurement.value = ''
    } else {
        row.measurement.value = `${wrap(left)} - ${wrap(right)}`
    }
    return row
}

/**
 * Kiểm trước khi lưu: mọi dòng phải có đủ CẢ HAI vế.
 *
 * Trả về dòng đầu tiên thiếu kèm số thứ tự, thay vì chỉ nói "có dòng chưa đủ" — người dùng
 * đang nhìn một bảng dài, phải chỉ được đúng dòng nào.
 *
 * @param {Array} testList         danh sách bài test của job
 * @param {string} testTypeCode    mã bài cần kiểm
 * @param {function} terminalsOf   (test) => danh sách đầu cực hợp lệ của bài đó
 */
export const validateTerminalRows = (testList, testTypeCode, terminalsOf, options = {}) => {
    const tests = (Array.isArray(testList) ? testList : [])
        .filter(t => t && t.testTypeCode === testTypeCode)

    for (const test of tests) {
        const terminals = terminalsOf ? terminalsOf(test) : []
        const rows = (test.data && test.data.table && Array.isArray(test.data.table.table1))
            ? test.data.table.table1
            : []
        for (let i = 0; i < rows.length; i++) {
            const sides = readSides(rows[i], terminals, options)
            if (sides.terminal1.length === 0 || sides.terminal2.length === 0) {
                return {
                    valid: false,
                    message: `Please select at least one option for both Terminal 1 and Terminal 2 in row ${i + 1}.`,
                }
            }
            // Ghi lại luôn: chuẩn hoá thứ tự và khuôn chuỗi trước khi xuống CSDL, để hai
            // dòng cùng nội dung không lưu thành hai chuỗi khác nhau.
            writeSides(rows[i], sides.terminal1, sides.terminal2, terminals, options)
        }
    }
    return { valid: true, message: '' }
}

export default { COMMON_ALIASES, parseSide, readSides, writeSides, validateTerminalRows }
