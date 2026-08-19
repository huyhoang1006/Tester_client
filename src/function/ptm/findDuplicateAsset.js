import db from '../datacontext/index'

/**
 * ĐỐI CHIẾU TRÙNG THIẾT BỊ theo (serial, manufacturer, manufacturer type).
 *
 * Quy tắc nghiệp vụ đã chốt:
 *
 *   trùng NGAY TRONG node đang import  ->  cho người dùng chọn ghi đè hoặc bỏ qua
 *   trùng ở NHÁNH KHÁC                 ->  báo đã tồn tại, phải xử lý trước, KHÔNG import
 *
 * ─── VÌ SAO PHẦN RỖNG KHÔNG TÍNH VÀO SO KHỚP ────────────────────────────────
 *
 * Trong file mẫu, `ManufacturerType` là RỖNG. Nếu so `'' === ''` thì tiêu chí đó luôn
 * đúng và bộ ba thành bộ đôi mà không ai biết — đối chiếu lỏng đi trong im lặng.
 *
 * Nên chỉ so những tiêu chí CÓ giá trị, và trả về `matchedOn` để tầng trên nói rõ với
 * người dùng là đã đối chiếu bằng mấy tiêu chí. Người dùng nhìn thấy "khớp theo serial +
 * manufacturer" thì tự biết mức độ chắc chắn, thay vì tin vào một chữ "trùng".
 *
 * ─── SO KHỚP KHÔNG PHÂN BIỆT HOA THƯỜNG VÀ KHOẢNG TRẮNG THỪA ────────────────
 *
 * Serial gõ tay ở hai nơi khác nhau rất hay lệch ' ABB' với 'ABB'. So thô thì bỏ sót
 * trùng, mà bỏ sót trùng nghĩa là tạo ra bản ghi thứ hai cho cùng một thiết bị — đúng
 * chuyện vừa phải dọn với hai node ADMIN.
 */

const norm = (v) => String(v === null || v === undefined ? '' : v).trim().toLowerCase()

const all = (sql, params) => new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
        if (err) return reject({ success: false, err, message: `Query failed: ${err.message}` })
        resolve(rows || [])
    })
})

/**
 * Tìm thiết bị trùng trong phạm vi của MỘT người dùng.
 *
 * @param {object} criteria { serialNumber, manufacturer, manufacturerType }
 * @param {string|number} userId
 * @param {string} targetPsrId mrid của node đang import vào (bay / trạm / cấp điện áp)
 * @returns {{ success, data: { matches: [], inTarget: [], elsewhere: [], matchedOn: [] } }}
 */
export const findDuplicateAsset = async (criteria, userId, targetPsrId) => {
    try {
        const serial = norm(criteria && criteria.serialNumber)
        const manufacturer = norm(criteria && criteria.manufacturer)
        const manufacturerType = norm(criteria && criteria.manufacturerType)

        // Không có serial thì không đối chiếu được gì đáng tin. Nói ra thay vì trả "không
        // trùng" — vì "không đối chiếu được" và "đã đối chiếu, không trùng" là hai chuyện.
        if (!serial) {
            return {
                success: true,
                data: { matches: [], inTarget: [], elsewhere: [], matchedOn: [], skippedCheck: true },
            }
        }

        // Chỉ lấy thiết bị thuộc về người dùng này. `user_identified_object` là cổng
        // quyền sở hữu — thiếu join này thì thấy cả thiết bị của người khác.
        const rows = await all(
            // DISTINCT: một thiết bị có thể mang hai dòng quyền sở hữu khác mrid (bảng
            // không có ràng buộc duy nhất trên cặp user + đối tượng). Thiếu DISTINCT thì
            // nó ra hai lần, và hộp thoại báo "trùng ở 2 chỗ" cho đúng MỘT thiết bị.
            `SELECT DISTINCT
                    a.mrid,
                    a.serial_number,
                    a.kind,
                    pam.manufacturer      AS manufacturer,
                    pam.model_number      AS manufacturer_type,
                    ap.psr_id             AS psr_id,
                    io.name               AS name
               FROM asset a
               JOIN user_identified_object uio ON uio.identified_object_id = a.mrid
               LEFT JOIN product_asset_model pam ON pam.mrid = a.product_asset_model
               LEFT JOIN asset_psr ap ON ap.asset_id = a.mrid
               LEFT JOIN identified_object io ON io.mrid = a.mrid
              WHERE uio.user_id = ?
                AND LOWER(TRIM(COALESCE(a.serial_number, ''))) = ?`,
            [String(userId), serial]
        )

        // Tiêu chí nào CÓ giá trị mới đem ra so. Ghi lại đã so bằng những gì.
        const matchedOn = ['serial']
        let matches = rows
        if (manufacturer) {
            matchedOn.push('manufacturer')
            matches = matches.filter(r => norm(r.manufacturer) === manufacturer)
        }
        if (manufacturerType) {
            matchedOn.push('manufacturer type')
            matches = matches.filter(r => norm(r.manufacturer_type) === manufacturerType)
        }

        const target = String(targetPsrId || '')
        const inTarget = matches.filter(r => String(r.psr_id || '') === target)
        const elsewhere = matches.filter(r => String(r.psr_id || '') !== target)

        return {
            success: true,
            data: { matches, inTarget, elsewhere, matchedOn, skippedCheck: false },
        }
    } catch (error) {
        console.error('[ptm] doi chieu trung asset that bai:', error)
        return {
            success: false,
            message: (error && error.message) ? error.message : 'Duplicate check failed',
        }
    }
}

export default { findDuplicateAsset }
