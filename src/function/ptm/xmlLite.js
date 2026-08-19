/**
 * BỘ ĐỌC XML TỐI GIẢN — chỉ dùng cho file .ptm của OMICRON.
 *
 * ─── VÌ SAO TỰ VIẾT ──────────────────────────────────────────────────────────
 *
 * `package.json` KHÔNG khai bộ đọc XML nào. Trong `node_modules` có `@xmldom`, `sax`,
 * `xml-js`… nhưng đều là phụ thuộc gián tiếp của gói khác — dùng chúng nghĩa là tin rằng
 * một gói khác sẽ mãi kéo chúng về. Lần `npm install` sau mà cây phụ thuộc đổi là tính
 * năng này chết, và chết ở chỗ khó đoán.
 *
 * Nên hoặc thêm phụ thuộc mới (phải cài mạng, phải duyệt), hoặc tự viết. Chọn tự viết vì
 * đầu vào ở đây RẤT HẸP: XML do máy sinh, một namespace, không CDATA, không nội dung trộn
 * (text và thẻ con không bao giờ nằm chung một cấp), không DTD.
 *
 * ─── GIỚI HẠN, NÓI TRƯỚC ─────────────────────────────────────────────────────
 *
 * Đây KHÔNG phải bộ đọc XML đầy đủ. Nó cố tình không hỗ trợ: CDATA, chỉ thị xử lý ngoài
 * khai báo đầu file, thực thể tự định nghĩa, nội dung trộn. Đưa XML khác vào là sai kết
 * quả — nên chỉ dùng cho .ptm, không mang đi chỗ khác.
 *
 * Bù lại: được kiểm chứng bằng cách so cấu trúc với ElementTree trên toàn bộ 15 file XML
 * của file mẫu, không phải chỉ vài trường hợp tự nghĩ ra.
 *
 * ─── DẠNG TRẢ VỀ ─────────────────────────────────────────────────────────────
 *
 *     { name, attrs: {}, text: '', children: [] }
 *
 * Giữ nguyên `children` là MẢNG chứ không gộp thành object theo tên thẻ. Lý do: XML này
 * có nhiều thẻ trùng tên cùng cấp (7 khối `<TimingCalculation>`), gộp thành object là mất
 * mát ngay, và mất một cách im lặng.
 */

const ENTITIES = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
}

/** Giải mã thực thể XML chuẩn + tham chiếu số (&#10; &#x1F;). */
const decodeEntities = (value) => {
    if (value.indexOf('&') === -1) return value
    return value
        .replace(/&(?:amp|lt|gt|quot|apos);/g, (m) => ENTITIES[m])
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
}

/** Tách chuỗi thuộc tính `a="1" b='2'` thành object. */
const parseAttributes = (raw) => {
    const attrs = {}
    if (!raw) return attrs
    const re = /([\w:.-]+)\s*=\s*("([^"]*)"|'([^']*)')/g
    let m
    while ((m = re.exec(raw)) !== null) {
        attrs[m[1]] = decodeEntities(m[3] !== undefined ? m[3] : m[4])
    }
    return attrs
}

/**
 * Đọc một chuỗi XML thành cây node.
 *
 * @param {string} xml
 * @returns {{name: string, attrs: object, text: string, children: Array}} node gốc
 */
export const parseXml = (xml) => {
    if (typeof xml !== 'string' || xml.trim() === '') {
        throw new Error('parseXml: chuỗi XML rỗng')
    }

    // Bỏ khai báo <?xml ?> và mọi comment <!-- --> trước khi đi vào vòng lặp chính, để
    // vòng lặp chỉ phải lo đúng ba trường hợp: thẻ mở, thẻ đóng, thẻ tự đóng.
    const source = xml
        .replace(/<\?[\s\S]*?\?>/g, '')
        .replace(/<!--[\s\S]*?-->/g, '')

    const root = { name: '#root', attrs: {}, text: '', children: [] }
    const stack = [root]
    const tagRe = /<\s*(\/?)\s*([\w:.-]+)((?:\s+[\w:.-]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)\s*>/g

    let lastIndex = 0
    let m

    while ((m = tagRe.exec(source)) !== null) {
        const [full, closing, name, rawAttrs, selfClose] = m
        const parent = stack[stack.length - 1]

        // Đoạn text nằm giữa thẻ trước và thẻ này thuộc về node đang mở.
        const between = source.slice(lastIndex, m.index)
        if (between && between.trim() !== '' && parent !== root) {
            parent.text += decodeEntities(between)
        }
        lastIndex = m.index + full.length

        if (closing) {
            // Thẻ đóng: bật khỏi ngăn xếp. Kiểm tên để phát hiện XML lệch thẻ thay vì
            // âm thầm dựng ra một cây sai.
            const open = stack.pop()
            if (!open || open.name !== name) {
                throw new Error(`parseXml: thẻ đóng </${name}> không khớp <${open ? open.name : 'không có'}>`)
            }
            continue
        }

        const node = { name, attrs: parseAttributes(rawAttrs), text: '', children: [] }
        parent.children.push(node)
        if (!selfClose) stack.push(node)
    }

    if (stack.length !== 1) {
        throw new Error(`parseXml: còn ${stack.length - 1} thẻ chưa đóng (${stack.slice(1).map(n => n.name).join(', ')})`)
    }

    const first = root.children[0]
    if (!first) throw new Error('parseXml: không tìm thấy thẻ gốc')
    return first
}

// ─── Truy cập tiện dụng ──────────────────────────────────────────────────────
// Bốn hàm dưới đây tồn tại để chỗ gọi không phải tự lặp `children.filter(...)` ở
// hàng chục nơi — lặp nhiều là sớm muộn có chỗ viết sai.

/** Mọi con trực tiếp mang tên này. */
export const childrenNamed = (node, name) =>
    (node && Array.isArray(node.children)) ? node.children.filter(c => c.name === name) : []

/** Con trực tiếp đầu tiên mang tên này, hoặc null. */
export const child = (node, name) => childrenNamed(node, name)[0] || null

/**
 * Text của một con trực tiếp.
 *
 * Trả `''` khi không có thẻ — KHÔNG trả null. Chỗ gọi luôn muốn một chuỗi, và trả hai
 * kiểu khác nhau tuỳ trường hợp là thứ đẻ ra `undefined.trim()`.
 */
export const textOf = (node, name) => {
    const found = child(node, name)
    return found ? String(found.text || '').trim() : ''
}

/** Thuộc tính `unit` của một con trực tiếp (OMICRON gắn đơn vị vào thuộc tính). */
export const unitOf = (node, name) => {
    const found = child(node, name)
    return found ? String(found.attrs.unit || '') : ''
}

export default { parseXml, childrenNamed, child, textOf, unitOf }
