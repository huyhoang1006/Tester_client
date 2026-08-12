/**
 * BẢN GỐC của một job — thứ chặn hai người ghi đè lên nhau.
 *
 * Từ khi server có cột `work.version`, mỗi lần lưu job phải kèm `baseVersion`:
 * phiên bản mà bản sửa này dựa trên. Server chỉ ghi khi số đó còn khớp; khác là
 * có người lưu trước, và nó trả 409 `VERSION_CONFLICT` thay vì ghi đè.
 *
 *     GET  download  ->  { ..., version: 7 }        client cat lai
 *     POST upload    <-  { ..., baseVersion: 7 }    gui tra dung so do
 *                        version con 7  -> ghi, version thanh 8
 *                        version da 9   -> 409, tai lai roi gop
 *
 * Chỗ cất là bảng `entity_snapshot` sẵn có, với `type = 'work'`. Cố ý dùng lại
 * bảng đó thay vì thêm một cột vào `sync_state`, vì bản ghi này về sau còn phải
 * gánh thêm một việc nữa: làm **bản gốc cho phép gộp ba chiều**.
 *
 * Gộp ba chiều cần biết giá trị ở ba thời điểm, không phải hai:
 *
 *     base 0.15, client 0.18, server 0.15   -> chi client sua  -> giu 0.18
 *     base 0.18, client 0.18, server 0.15   -> chi server sua  -> giu 0.15
 *     base 0.15, client 0.18, server 0.20   -> ca hai sua      -> hoi nguoi dung
 *
 * Không có `base` thì hai dòng đầu nhìn giống hệt nhau — cùng là "client 0.18,
 * server 0.15" — và không cách nào biết bên nào mới là bên vừa sửa. Vì vậy mỗi
 * lần đồng bộ thành công đều phải cất lại bản gốc, và **chỉ lúc đó**.
 *
 * TUYỆT ĐỐI KHÔNG ghi bản gốc khi người dùng sửa ở local. Bản gốc phải đứng yên
 * ở mốc đồng bộ cuối cùng trong khi bản client trôi đi; ghi nhầm ở đây làm hỏng
 * cả cơ chế, và hỏng lặng lẽ — không có lỗi nào nổ ra, chỉ có những lần gộp cho
 * ra kết quả sai.
 */

/** Giá trị cột `type` trong `entity_snapshot`. Trùng tên bảng `work` bên server. */
export const JOB_SNAPSHOT_TYPE = 'work'

/**
 * Bản gốc đã cất của một job.
 *
 * @param {string} mrid id job
 * @returns {Promise<object|null>} bản đã cất, hoặc null nếu job này chưa từng đồng bộ
 */
export const getJobSnapshot = async (mrid) => {
    if (!mrid) return null
    try {
        const rs = await window.electronAPI.getEntitySnapshotByMrid(mrid, JOB_SNAPSHOT_TYPE)
        return rs && rs.success ? (rs.data || null) : null
    } catch (e) {
        console.warn('[jobSnapshot] khong doc duoc ban goc cua job', mrid, e)
        return null
    }
}

/**
 * Phiên bản để gửi kèm khi lưu job.
 *
 * `null` mang nghĩa rất cụ thể với server: "job này chưa từng lên server". Nếu
 * thật sự chưa có thì nó tạo mới; nếu đã có thì đó là 409 — gửi null để đè lên
 * một job đang tồn tại đúng là việc cần cấm.
 *
 * @param {string} mrid id job
 * @returns {Promise<number|null>} phiên bản đã cất, hoặc null
 */
export const getJobBaseVersion = async (mrid) => {
    const snap = await getJobSnapshot(mrid)
    if (!snap) return null
    const v = snap.version
    return (v === null || v === undefined) ? null : v
}

/**
 * Cất lại bản gốc sau một lần đồng bộ THÀNH CÔNG.
 *
 * Gọi ở đúng hai chỗ, không thêm chỗ nào khác:
 *   1. tải job về xong  -> `payload` là thứ server vừa trả
 *   2. lưu job lên xong -> `payload` là thứ ta vừa gửi, `version` lấy từ phản hồi
 *
 * Ở trường hợp 2, bản gốc không hoàn toàn bằng thứ server đang giữ: server có
 * chuẩn hoá vài chỗ khi ghi (ký tự đơn vị đưa về dạng chuẩn, đánh giá tính lại).
 * Chấp nhận được — lần tải về sau sẽ thấy những chỗ đó "server có sửa, client
 * không", và tự lấy theo server. Đổi lại là khỏi tải lại nguyên job sau mỗi lần
 * lưu.
 *
 * @param {string} mrid    id job
 * @param {object} payload nội dung job ở dạng server
 * @param {number} version phiên bản job SAU thao tác vừa rồi
 * @returns {Promise<boolean>} true nếu cất được
 */
export const saveJobSnapshot = async (mrid, payload, version) => {
    if (!mrid) return false
    const snapshot = { ...(payload || {}) }
    if (version !== null && version !== undefined) {
        snapshot.version = version
    }
    try {
        const rs = await window.electronAPI.insertEntitySnapshot({
            mrid,
            type: JOB_SNAPSHOT_TYPE,
            snapshot
        })
        return !!(rs && rs.success)
    } catch (e) {
        // Nuốt lỗi có chủ ý: job đã lưu lên server xong rồi, không được để một
        // lỗi ở tầng ghi bản gốc làm người dùng tưởng lần lưu đó hỏng. Hậu quả
        // xấu nhất là lần lưu sau ăn 409 và phải tải lại — phiền, không mất gì.
        console.warn('[jobSnapshot] khong cat duoc ban goc cua job', mrid, e)
        return false
    }
}

/**
 * Xoá bản gốc. Gọi khi xoá job ở local, để bảng không phình theo thời gian.
 *
 * @param {string} mrid id job
 * @returns {Promise<boolean>} true nếu xoá được
 */
export const deleteJobSnapshot = async (mrid) => {
    if (!mrid) return false
    try {
        const rs = await window.electronAPI.deleteEntitySnapshotByMrid(mrid, JOB_SNAPSHOT_TYPE)
        return !!(rs && rs.success)
    } catch (e) {
        console.warn('[jobSnapshot] khong xoa duoc ban goc cua job', mrid, e)
        return false
    }
}
