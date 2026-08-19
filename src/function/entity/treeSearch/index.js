import db from '../../datacontext/index'
import { SEARCH_TARGETS } from './searchFields'

/**
 * TÌM KIẾM TRÊN TOÀN BỘ CSDL, không chỉ phần cây đã nạp.
 *
 * ─── VÌ SAO KHÔNG LỌC CÂY TRONG BỘ NHỚ ──────────────────────────────────────
 *
 * Cây nạp dần từng nhánh khi người dùng bấm mở. Lọc thứ đã nạp thì nhánh chưa mở không
 * tìm ra được — mà lúc mới vào app thì gần như cả cây là chưa mở. Ô tìm kiếm kiểu đó trả
 * về "không có kết quả" cho thứ ĐANG NẰM trong CSDL, và người dùng sẽ tin là không có.
 *
 * ─── QUYỀN SỞ HỮU LÀ ĐIỀU KIỆN BẮT BUỘC, KHÔNG PHẢI LỌC THÊM ────────────────
 *
 * INNER JOIN `user_identified_object` chứ không LEFT: một node không thuộc về người dùng
 * hiện tại thì phải KHÔNG có trong kết quả, không phải "có nhưng bị ẩn". Đây là đường
 * duy nhất dữ liệu ra khỏi CSDL mà không đi qua các truy vấn cây (vốn đã join sẵn bảng
 * này), nên nếu quên ở đây thì tìm kiếm thành lỗ rò dữ liệu giữa các tài khoản.
 *
 * ─── LIKE VÀ KÝ TỰ ĐẶC BIỆT ─────────────────────────────────────────────────
 *
 * `%` và `_` là ký tự đại diện của LIKE. Gõ "100%" mà không thoát thì nó khớp mọi thứ bắt
 * đầu bằng "100" — nhìn thì tưởng tìm được nhiều, thật ra là sai. Dùng ESCAPE và thoát cả
 * `\` để không tự tạo lỗ hổng ngữ nghĩa.
 */

/** Thoát ký tự đại diện của LIKE. Thứ tự quan trọng: `\` phải thoát TRƯỚC. */
const escapeLike = (text) => String(text)
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')

/** Cắt bớt giá trị dài để hiển thị, giữ nguyên đoạn chứa từ khoá. */
const snippet = (value, keyword, span = 60) => {
    const text = String(value)
    if (text.length <= span) return text
    const at = text.toLowerCase().indexOf(String(keyword).toLowerCase())
    if (at < 0) return text.slice(0, span) + '…'
    const from = Math.max(0, at - 20)
    return (from > 0 ? '…' : '') + text.slice(from, from + span) + (from + span < text.length ? '…' : '')
}

const runQuery = (sql, params) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) return reject({ success: false, err, message: `Search failed: ${err.message}` })
        return resolve(rows || [])
    })
})

/**
 * @param {string|number} userId  người dùng đang đăng nhập
 * @param {string} keyword        từ khoá, khớp kiểu "chứa"
 * @param {object} options        { limit = 50, modes = tất cả }
 * @returns {{success, data: [], message}} mỗi phần tử:
 *   { mrid, mode, typeLabel, title, matchedField, matchedValue, otherMatches }
 */
export const searchTree = async (userId, keyword, options = {}) => {
    const term = String(keyword || '').trim()
    if (!userId) {
        return { success: false, data: [], message: 'No user is signed in' }
    }
    // Từ khoá quá ngắn thì trả về rỗng nhưng KHÔNG coi là lỗi: người dùng mới gõ một chữ,
    // đây là trạng thái bình thường chứ không phải hỏng.
    if (term.length < 2) {
        return { success: true, data: [], message: 'Type at least 2 characters' }
    }

    const limit = Number(options.limit) > 0 ? Number(options.limit) : 50
    const modes = Array.isArray(options.modes) && options.modes.length > 0
        ? options.modes.filter(m => SEARCH_TARGETS[m])
        : Object.keys(SEARCH_TARGETS)

    const pattern = `%${escapeLike(term)}%`
    const results = []
    const failures = []

    for (const mode of modes) {
        const target = SEARCH_TARGETS[mode]
        const fields = target.fields

        // Lấy TẤT CẢ trường ra rồi xác định trường nào khớp ở JS, thay vì dựng một chuỗi
        // CASE khổng lồ trong SQL. Nhiều nhất 15 cột một dòng — rẻ, và đọc/kiểm được.
        const selectFields = fields
            .map((f, i) => `${f.expr} AS f${i}`)
            .join(', ')
        const whereFields = fields
            .map(f => `${f.expr} LIKE ? ESCAPE '\\'`)
            .join(' OR ')

        // DISTINCT là BẮT BUỘC, không phải cho đẹp.
        //
        // `user_identified_object` không có ràng buộc duy nhất trên cặp (user, đối tượng),
        // nên một node có thể mang hai dòng quyền sở hữu khác mrid — và đã từng xảy ra
        // thật với luồng import Word. JOIN không DISTINCT thì node đó hiện HAI LẦN trong
        // kết quả tìm kiếm.
        //
        // Tầng ghi đã dọn dòng trùng, nhưng máy có dữ liệu cũ thì vẫn còn; truy vấn phải
        // tự đứng vững chứ không dựa vào việc dữ liệu đã sạch.
        const sql = `
            SELECT DISTINCT ${target.idColumn} AS mrid, ${selectFields}
            FROM ${target.base}
            ${target.joins.join('\n            ')}
            INNER JOIN user_identified_object uio
                    ON uio.identified_object_id = ${target.idColumn} AND uio.user_id = ?
            WHERE ${whereFields}
            LIMIT ?
        `
        const params = [userId, ...fields.map(() => pattern), limit]

        try {
            const rows = await runQuery(sql, params)
            for (const row of rows) {
                const matches = []
                fields.forEach((f, i) => {
                    const value = row[`f${i}`]
                    if (value === null || value === undefined) return
                    if (String(value).toLowerCase().includes(term.toLowerCase())) {
                        matches.push({ label: f.label, value: snippet(value, term) })
                    }
                })
                if (matches.length === 0) continue

                // Tiêu đề: ưu tiên đúng thứ đang hiện trên cây (alias trước, rồi name).
                const aliasIdx = fields.findIndex(f => f.expr === 'io.alias_name')
                const nameIdx = fields.findIndex(f => f.expr === 'io.name')
                const title = (aliasIdx >= 0 && row[`f${aliasIdx}`])
                    || (nameIdx >= 0 && row[`f${nameIdx}`])
                    || '(no name)'

                results.push({
                    mrid: row.mrid,
                    mode: target.mode,
                    typeLabel: target.typeLabel,
                    title: String(title),
                    matchedField: matches[0].label,
                    matchedValue: matches[0].value,
                    otherMatches: matches.slice(1),
                })
            }
        } catch (error) {
            // Một loại node hỏng thì KHÔNG chôn cả tìm kiếm — trả về những loại chạy được
            // và nói rõ loại nào hỏng. Im lặng ở đây nghĩa là người dùng tin rằng thứ họ
            // tìm không tồn tại.
            console.error(`[search] loai "${mode}" that bai:`, error)
            failures.push(`${target.typeLabel}: ${(error && error.message) || 'query failed'}`)
        }
    }

    // Khớp ở tên xếp trước khớp ở ô phụ — người gõ tên mong thấy tên trước tiên.
    const titleFirst = (r) => (r.matchedField === 'Name' || r.matchedField === 'Display name'
        || r.matchedField === 'Apparatus ID') ? 0 : 1
    results.sort((a, b) => titleFirst(a) - titleFirst(b)
        || a.typeLabel.localeCompare(b.typeLabel)
        || a.title.localeCompare(b.title))

    return {
        success: true,
        data: results.slice(0, limit),
        truncated: results.length > limit,
        failures,
        message: failures.length > 0
            ? `Search completed, ${failures.length} node type(s) failed`
            : 'Search completed',
    }
}

/**
 * CHUỖI CHA của một node, từ gốc xuống tới chính nó.
 *
 * ─── VÌ SAO PHẢI HỎI CSDL THAY VÌ DÒ TRÊN CÂY ───────────────────────────────
 *
 * Kết quả tìm kiếm chỉ có `mrid`. Muốn mở cây tới đó mà không biết đường thì phải bung
 * TỪNG nhánh một để dò — với cây vài nghìn node là bung gần hết cây chỉ để tìm một cái.
 * Hỏi CSDL thì biết trước đúng những cấp cần mở.
 *
 * ─── MỖI LOẠI NODE MỘT ĐƯỜNG LÊN CHA, VÌ CSDL LÀ NHƯ VẬY ────────────────────
 *
 *   job          -> old_work.asset_id           -> asset
 *   asset        -> asset_psr.psr_id            -> bay / voltage_level / substation
 *   bay          -> bay.voltage_level, .substation
 *   voltageLevel -> voltage_level.substation
 *   substation   -> organisation_psr.organisation_id
 *   organisation -> organisation.parent_organisation
 *
 * ─── CHỐNG VÒNG LẶP ─────────────────────────────────────────────────────────
 *
 * `parent_organisation` là con trỏ tự do, không có gì chặn A -> B -> A. Dữ liệu hỏng kiểu
 * đó sẽ treo hàm này thành vòng lặp vô hạn và app đứng im, nên có mốc chặn cả bằng số cấp
 * lẫn bằng tập mrid đã đi qua.
 */
const MAX_DEPTH = 12

const getOne = (sql, params) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
        if (err) return reject({ success: false, err, message: `Path lookup failed: ${err.message}` })
        return resolve(row || null)
    })
})

/** Cha trực tiếp của một node: { mrid, mode } hoặc null nếu đã ở gốc. */
const findParent = async (mrid, mode) => {
    if (mode === 'job') {
        const row = await getOne('SELECT asset_id FROM old_work WHERE mrid = ?', [mrid])
        return row && row.asset_id ? { mrid: row.asset_id, mode: 'asset' } : null
    }
    if (mode === 'asset') {
        const row = await getOne('SELECT psr_id FROM asset_psr WHERE asset_id = ?', [mrid])
        if (!row || !row.psr_id) return null
        return { mrid: row.psr_id, mode: await modeOfPsr(row.psr_id) }
    }
    if (mode === 'bay') {
        const row = await getOne('SELECT voltage_level, substation FROM bay WHERE mrid = ?', [mrid])
        if (!row) return null
        if (row.voltage_level) return { mrid: row.voltage_level, mode: 'voltageLevel' }
        if (row.substation) return { mrid: row.substation, mode: 'substation' }
        return null
    }
    if (mode === 'voltageLevel') {
        const row = await getOne('SELECT substation FROM voltage_level WHERE mrid = ?', [mrid])
        return row && row.substation ? { mrid: row.substation, mode: 'substation' } : null
    }
    if (mode === 'substation') {
        const row = await getOne('SELECT organisation_id FROM organisation_psr WHERE psr_id = ?', [mrid])
        return row && row.organisation_id ? { mrid: row.organisation_id, mode: 'organisation' } : null
    }
    if (mode === 'organisation') {
        const row = await getOne('SELECT parent_organisation FROM organisation WHERE mrid = ?', [mrid])
        return row && row.parent_organisation ? { mrid: row.parent_organisation, mode: 'organisation' } : null
    }
    return null
}

/** Một psr_id có thể là bay, voltage level hoặc substation — hỏi cho chắc. */
const modeOfPsr = async (psrId) => {
    if (await getOne('SELECT mrid FROM bay WHERE mrid = ?', [psrId])) return 'bay'
    if (await getOne('SELECT mrid FROM voltage_level WHERE mrid = ?', [psrId])) return 'voltageLevel'
    if (await getOne('SELECT mrid FROM substation WHERE mrid = ?', [psrId])) return 'substation'
    return null
}

/**
 * @returns {{success, data: [{mrid, mode, name}]}} từ GỐC xuống tới node, gồm cả node.
 */
export const getNodePath = async (mrid, mode) => {
    if (!mrid || !mode) {
        return { success: false, data: [], message: 'Missing node id or type' }
    }
    try {
        const chain = [{ mrid, mode }]
        const seen = new Set([mrid])
        let current = { mrid, mode }

        for (let depth = 0; depth < MAX_DEPTH; depth++) {
            const parent = await findParent(current.mrid, current.mode)
            if (!parent || !parent.mrid || !parent.mode) break
            if (seen.has(parent.mrid)) {
                // Vòng trong dữ liệu. Trả về phần đi được và NÓI RA — im lặng ở đây thì
                // cây mở tới nửa đường và không ai hiểu vì sao.
                console.error('[search] vong lap trong chuoi cha tai', parent.mrid)
                return {
                    success: true,
                    data: chain,
                    truncatedPath: true,
                    message: 'Parent chain contains a loop, path may be incomplete',
                }
            }
            seen.add(parent.mrid)
            chain.unshift(parent)
            current = parent
        }

        // Kèm tên để bên gọi báo lỗi cho ra hồn khi mở cây không tới.
        for (const step of chain) {
            const row = await getOne('SELECT name, alias_name FROM identified_object WHERE mrid = ?', [step.mrid])
            step.name = (row && (row.alias_name || row.name)) || ''
        }

        return { success: true, data: chain, message: 'Path resolved' }
    } catch (error) {
        console.error('[search] dung chuoi cha that bai:', error)
        return { success: false, data: [], message: (error && error.message) || 'Path lookup failed' }
    }
}

export default { searchTree, getNodePath }
