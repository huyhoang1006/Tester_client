// Ngày thử nghiệm của test trên cây client.
//
// Job đã thành lớp ẩn, nên dưới thiết bị là danh sách test trải phẳng và năm của một
// test được quyết định bởi NGÀY THỬ NGHIỆM CỦA CHÍNH NÓ, không phải job ẩn chứa nó. Test
// thêm vào "Job 2026" rồi sửa ngày thử sang 2025 thì trên cây nó đứng cùng các test 2025.
//
// Ngày lưu theo value-format của TestInformation là "MM/dd/yyyy" - so sánh chuỗi là sai
// ("01/05/2026" < "12/20/2025"), nên phải tách ra thành mốc thời gian trước khi so.

const pad = (value) => String(value).padStart(2, '0')

// "MM/dd/yyyy" - định dạng đang dùng khi lưu test và job
const US_DATE = /^\s*(\d{1,2})\/(\d{1,2})\/(\d{4})/
// "yyyy-MM-dd", có thể kèm giờ - dữ liệu kéo từ server hoặc import
const ISO_DATE = /^\s*(\d{4})-(\d{1,2})-(\d{1,2})/

const validDate = (year, month, day) => {
    const date = new Date(year, month - 1, day)
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
        ? date.getTime()
        : null
}

/** Mốc thời gian (ms) của một giá trị ngày, null nếu không đọc được. */
export const parseTestDate = (value) => {
    if (value === null || value === undefined || value === '') return null
    if (typeof value === 'number') return Number.isFinite(value) ? value : null

    const text = String(value)
    let match = text.match(US_DATE)
    if (match) return validDate(Number(match[3]), Number(match[1]), Number(match[2]))

    match = text.match(ISO_DATE)
    if (match) return validDate(Number(match[1]), Number(match[2]), Number(match[3]))

    if (/^\s*\d+\s*$/.test(text)) return Number(text)

    const parsed = Date.parse(text)
    return Number.isNaN(parsed) ? null : parsed
}

/** Năm của ngày thử nghiệm, null nếu không đọc được. */
export const testYearOf = (value) => {
    const time = parseTestDate(value)
    return time === null ? null : new Date(time).getFullYear()
}

/** Hôm nay theo đúng định dạng TestInformation lưu ("MM/dd/yyyy"). */
export const todayTestDate = () => {
    const now = new Date()
    return `${pad(now.getMonth() + 1)}/${pad(now.getDate())}/${now.getFullYear()}`
}

/**
 * Sắp theo ngày thử nghiệm (trường execution_date của node): mới nhất lên đầu, cùng ngày
 * thì theo tên. Dòng không đọc được ngày xuống cuối. Không đổi mảng gốc.
 */
export const sortRowsByTestDate = (rows) => (Array.isArray(rows) ? rows : [])
    .map((row, index) => ({ row, index, time: parseTestDate(row && row.execution_date) }))
    .sort((a, b) => {
        if (a.time !== b.time) {
            if (a.time === null) return 1
            if (b.time === null) return -1
            return b.time - a.time
        }
        const byName = String((a.row && a.row.name) || '').localeCompare(String((b.row && b.row.name) || ''))
        return byName !== 0 ? byName : a.index - b.index
    })
    .map(entry => entry.row)

/**
 * Như trên nhưng cho danh sách con đã có trên cây: chỉ sắp các node test, node khác giữ
 * nguyên thứ tự và đứng đầu.
 */
export const sortTestsByDate = (rows) => {
    const list = Array.isArray(rows) ? rows : []
    const others = list.filter(row => !row || row.mode !== 'test')
    const tests = list.filter(row => row && row.mode === 'test')
    return [...others, ...sortRowsByTestDate(tests)]
}
