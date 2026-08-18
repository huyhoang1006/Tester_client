/**
 * Dựng thông báo lỗi ĐỌC ĐƯỢC từ kết quả của tầng function.
 *
 * ─── VẤN ĐỀ ──────────────────────────────────────────────────────────────────
 *
 * 110 handler trong `src/ipcmain` có cùng một khuôn: khi tầng dưới báo hỏng, nhánh `else`
 * trả về đúng bốn chữ cái `fail` và vứt sạch mọi thứ tầng dưới đã nói.
 *
 * Mà tầng dưới nói rất rõ:
 *
 *     message: 'Insert lifecycle date transaction failed'
 *     err:     SQLITE_CONSTRAINT: NOT NULL constraint failed: lifecycle_date.mrid
 *
 * Import 39 thiết bị hỏng thì người dùng nhận 39 dòng giống hệt nhau — không phân biệt
 * được, không lần được, phải mở DevTools đọc log mới biết chuyện gì.
 *
 * Hàm này lấy lại phần đã có sẵn: thông báo của tầng function, cộng chi tiết SQLite nếu
 * có. Không bịa gì thêm — chỉ ngừng vứt đi.
 *
 * @param {object} rs kết quả từ tầng function
 * @returns {string} thông báo đọc được, hoặc 'fail' nếu thật sự không có gì
 */
export const describeFailure = (rs) => {
    if (!rs) return 'fail'

    const parts = []
    if (rs.message && rs.message !== 'fail') parts.push(String(rs.message))

    // `err` có thể là Error thật, hoặc object lỗi lồng nhiều tầng mà tầng function tự dựng
    // ({ success, err, message }). Lần xuống tối đa vài tầng để lấy câu SQLite gốc — đó mới
    // là câu chỉ đúng cột nào vi phạm.
    let cause = rs.err || rs.error
    for (let depth = 0; cause && depth < 5; depth++) {
        const text = cause.message || cause.msg
        if (text && !parts.includes(String(text))) parts.push(String(text))
        cause = cause.err || cause.error
    }

    return parts.length ? parts.join(' — ') : 'fail'
}

export default describeFailure
