/**
 * ROLLBACK KHÔNG BAO GIỜ ĐƯỢC NÉM ĐÈ LÊN LỖI THẬT.
 *
 * ─── LỖI ĐÃ GẶP ─────────────────────────────────────────────────────────────
 *
 * Người dùng thấy: "Import failed: SQLITE_ERROR: cannot rollback - no transaction is
 * active". Câu đó KHÔNG phải nguyên nhân — nó là lỗi của chính lệnh dọn dẹp. Lỗi thật đã
 * bị nuốt mất và không hiện ra ở đâu cả.
 *
 * Mẫu sinh ra chuyện này có ở 25 file: trong khối catch, lệnh lùi giao dịch được gọi bằng
 * await mà không bọc try. Nếu lệnh đó reject thì lời hứa của cả hàm reject theo, câu
 * return bên dưới không bao giờ chạy, và lỗi gốc biến mất. Người đọc log chỉ còn thấy
 * triệu chứng của bước dọn dẹp.
 *
 * ─── KHI NÀO SQLITE BÁO "no transaction is active" ──────────────────────────
 *
 * Hai trường hợp, và cả hai đều BÌNH THƯỜNG chứ không phải hỏng:
 *
 *   1. Hỏng TRƯỚC khi kịp mở giao dịch — chưa mở thì không có gì để đóng.
 *   2. Hỏng SAU khi đã commit — ví dụ bước ghi nhật ký chạy sau commit. Nguy hiểm hơn
 *      trường hợp 1: dữ liệu ĐÃ LƯU rồi, mà người dùng lại nhận thông báo thất bại và đi
 *      làm lại từ đầu, sinh ra bản ghi trùng.
 *
 * Nên ở đây nuốt riêng lỗi lùi giao dịch (có ghi log), và trả về việc nó có thật sự lùi
 * được hay không để chỗ gọi phân biệt được hai tình huống trên.
 *
 * LƯU Ý CHO NGƯỜI SỬA SAU: file này cố ý KHÔNG viết chữ R-O-L-L-B-A-C-K trong phần chú
 * thích. Bản đầu tôi thay 61 chỗ bằng script tìm-thay, và script khớp luôn chuỗi nằm
 * trong chú thích của chính file này rồi tự chèn import vòng về chính nó.
 */

const UNDO_SQL = 'ROLL' + 'BACK'

/**
 * @param {function} runAsync hàm chạy SQL của module gọi
 * @param {Error}    original lỗi gốc, chỉ dùng để ghi log cho có ngữ cảnh
 * @returns {Promise<boolean>} true nếu thật sự đã lùi được giao dịch
 */
export const rollbackQuietly = async (runAsync, original) => {
    try {
        await runAsync(UNDO_SQL)
        return true
    } catch (undoError) {
        const message = (undoError && undoError.message) || String(undoError)
        if (message.indexOf('no transaction is active') >= 0) {
            // Không có giao dịch để lùi. Cảnh báo chứ không im: nếu lỗi gốc xảy ra sau
            // commit thì dữ liệu đã nằm trong CSDL rồi.
            console.warn('[db] khong co giao dich de lui — loi goc xay ra truoc BEGIN hoac sau COMMIT:',
                (original && original.message) || original)
        } else {
            console.error('[db] lui giao dich that bai:', undoError, '| loi goc:', original)
        }
        return false
    }
}

export default { rollbackQuietly }
