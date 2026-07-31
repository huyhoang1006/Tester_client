/**
 * Hệ số đấu nối Upr của biến áp đo lường (VT).
 *
 * HIỂN THỊ một đằng, LƯU một nẻo — cố ý:
 *
 *   - Người dùng thấy và chọn "1 / 1", "1 / 3", "1 / √3", giống hệt dropdown Upr
 *     bên tab Ratings của asset.
 *   - Ô lưu GIÁ TRỊ SỐ đã quy đổi ('1', '0.333333', '0.57735').
 *
 * Vì sao không lưu mã kiểu '3sqrt' như bên asset: cột `upr` của bài test VTRatio
 * là kiểu ANALOG, ghi xuống bảng analog_value. Nhét chuỗi '3sqrt' vào đó thì
 *   - ratio_dev tính bằng parseFloat(item.upr.value) sẽ ra NaN,
 *   - bảng Compare không tính được Δ,
 *   - dữ liệu gửi lên server sai kiểu.
 * Lưu số thì mọi phép tính chạy thẳng, chỉ phần nhãn là việc của giao diện.
 */

export const UPR_OPTIONS = [
    { code: '1',     label: '1 / 1',  value: '1' },
    { code: '3',     label: '1 / 3',  value: String(Number((1 / 3).toFixed(6))) },        // 0.333333
    { code: '3sqrt', label: '1 / √3', value: String(Number((1 / Math.sqrt(3)).toFixed(6))) } // 0.57735
]

/**
 * Mã bên asset ('1' | '3' | '3sqrt') → giá trị số để lưu vào ô.
 * Chưa chọn hoặc mã lạ thì trả '' — để trống, không đoán bừa thành 1.
 */
export const uprValueFromCode = (code) => {
    const found = UPR_OPTIONS.find(option => option.code === code)
    return found ? found.value : ''
}

/**
 * Giá trị đang có trong ô → value của option để el-select highlight đúng.
 *
 * So bằng SỐ với sai số nhỏ, không so chuỗi: giá trị có thể quay về từ DB dưới
 * dạng number 0.57735 hoặc chuỗi '0.577350', so chuỗi sẽ trượt và ô hiện rỗng.
 * Giá trị không khớp option nào (vd dữ liệu cũ lưu nhầm '3') cũng trả '' để
 * người dùng thấy ngay là phải chọn lại.
 */
export const matchUprOption = (value) => {
    if (value === null || value === undefined || String(value).trim() === '') return ''
    const num = Number(value)
    if (isNaN(num)) return ''
    const found = UPR_OPTIONS.find(option => Math.abs(num - Number(option.value)) < 1e-4)
    return found ? found.value : ''
}

export default UPR_OPTIONS
