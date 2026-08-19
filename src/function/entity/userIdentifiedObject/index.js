import db from '../../datacontext/index'
import { hasUserSuffix, replaceUserSuffix } from '@/utils/serverId'
import { insertUser, insertUserTransaction } from '@/function/entity/user'

/**
 * ĐẢM BẢO CÓ DÒNG TRONG BẢNG `user` TRƯỚC KHI GHI QUYỀN SỞ HỮU.
 *
 * ─── VÌ SAO ──────────────────────────────────────────────────────────────────
 *
 *     FOREIGN KEY("user_id") REFERENCES "user"("user_id") ON DELETE CASCADE
 *
 * Đăng nhập KHÔNG ghi gì vào bảng `user` — `afterLogin` chỉ lưu localStorage và Vuex
 * (utils/helper.js). Nên trên một máy vừa đăng nhập, bảng `user` rỗng, và MỌI lần ghi
 * user_identified_object đều vi phạm khoá ngoại. Đó là toàn bộ nguyên nhân của
 * "ensure ownership failed: 148@org Insert userIdentifiedObject failed" lặp lại ở
 * từng node khi import.
 *
 * Trước đây lỗi này bị che vì `insertSubstationEntity` có gọi `insertUserTransaction`
 * ngay trong transaction của nó, nên hễ đã lưu một substation là bảng `user` có dòng.
 * Import thì organisation đi trước substation, nên 14 organisation đầu tiên đổ hết —
 * và organisation là gốc cây, mất gốc là mất cả cây.
 *
 * Chỉ ghi `user_id`; các cột khác để null. An toàn vì upsert bên `user` dùng COALESCE:
 * null nghĩa là "giữ nguyên", nên gọi hàm này KHÔNG xoá username/role/token của người
 * đang đăng nhập.
 */
const ensureUserRow = async (userId, dbsql = null) => {
    try {
        const payload = { user_id: String(userId), role: null, permission: null, username: null, token: null, group_user: null }
        if (dbsql) await insertUserTransaction(payload, dbsql)
        else await insertUser(payload)
    } catch (error) {
        // Không chặn: nếu dòng đã có thì upsert cũng không lỗi, còn lỗi thật sẽ hiện ra
        // ở bước ghi user_identified_object ngay sau đây kèm thông báo SQLite đầy đủ.
        console.warn('[userIdentifiedObject] ensure user row failed:', userId, error && (error.message || error))
    }
}

const ownershipMrid = (userId, identifiedObjectId) => {
    const id = String(identifiedObjectId)
    return hasUserSuffix(id) ? replaceUserSuffix(id, userId) : `${id}@u-${userId}`
}

const ownershipIdentifiedObjectId = (userId, identifiedObjectId) => {
    const id = String(identifiedObjectId)
    return hasUserSuffix(id) ? replaceUserSuffix(id, userId) : id
}

export const ensureUserIdentifiedObject = async (userId, identifiedObjectId, mrid = null) => {
    if (!userId || !identifiedObjectId) {
        return { success: false, message: 'user_id and identified_object_id are required' }
    }
    await ensureUserRow(userId)
    const ownedIdentifiedObjectId = ownershipIdentifiedObjectId(userId, identifiedObjectId)
    return insertUserIdentifiedObject({
        mrid: mrid || ownershipMrid(userId, ownedIdentifiedObjectId),
        user_id: userId,
        identified_object_id: ownedIdentifiedObjectId
    })
}

export const ensureUserIdentifiedObjectTransaction = async (userId, identifiedObjectId, dbsql, mrid = null) => {
    if (!userId || !identifiedObjectId) {
        return { success: false, message: 'user_id and identified_object_id are required' }
    }
    await ensureUserRow(userId, dbsql)
    const ownedIdentifiedObjectId = ownershipIdentifiedObjectId(userId, identifiedObjectId)
    return insertUserIdentifiedObjectTransaction({
        mrid: mrid || ownershipMrid(userId, ownedIdentifiedObjectId),
        user_id: userId,
        identified_object_id: ownedIdentifiedObjectId
    }, dbsql)
}

/**
 * MỘT NGƯỜI DÙNG — MỘT ĐỐI TƯỢNG — ĐÚNG MỘT DÒNG QUYỀN SỞ HỮU.
 *
 * ─── VÌ SAO PHẢI DỌN THAY VÌ TIN VÀO KHOÁ ───────────────────────────────────
 *
 * Bảng chỉ có PRIMARY KEY trên `mrid`, KHÔNG có ràng buộc duy nhất trên cặp
 * (user_id, identified_object_id). Nghĩa là hai dòng khác mrid nhưng cùng một cặp là hợp
 * lệ với SQLite, và `ON CONFLICT(mrid)` không hề phát hiện.
 *
 * Trong mã đang có HAI quy ước sinh mrid khác nhau cho cùng một việc:
 *
 *   ensureUserIdentifiedObject   ->  '<id đối tượng>@u-<user id>'
 *   checkUserIdentifiedObject    ->  uuid ngẫu nhiên   (mixin substation, mapper thiết bị thử)
 *
 * Luồng import Word chạy CẢ HAI cho cùng một trạm: `insertSubstationEntity` ghi dòng theo
 * quy ước uuid, rồi `_withOwnership` ghi tiếp dòng theo quy ước '@u-'. Kết quả là hai dòng
 * cho cùng một cặp — và truy vấn cây nào JOIN bảng này mà thiếu DISTINCT sẽ trả node ra
 * HAI LẦN. Đúng triệu chứng "hai node ADMIN" đã gặp.
 *
 * Thống nhất quy ước ở tất cả các chỗ gọi thì tốt hơn, nhưng không đủ: dữ liệu cũ đã có
 * sẵn dòng trùng, và bất kỳ chỗ gọi mới nào cũng có thể lặp lại. Nên chốt ở đây — tầng
 * DUY NHẤT mà mọi luồng đều đi qua.
 *
 * Không thêm UNIQUE INDEX vì nó sẽ dựng không nổi trên máy đã có dòng trùng, và dựng lỗi
 * lúc khởi động thì mất luôn những bảng tạo sau nó.
 */
const dedupeOwnership = (runner, row) => {
    return new Promise((resolve) => {
        if (!row || !row.user_id || !row.identified_object_id) return resolve()
        runner.run(
            `DELETE FROM user_identified_object
              WHERE user_id = ? AND identified_object_id = ? AND mrid <> ?`,
            [row.user_id, row.identified_object_id, row.mrid],
            function (err) {
                // Không chặn: dọn hỏng thì tệ nhất là còn dòng thừa như trước, còn chặn ở
                // đây là mất luôn quyền sở hữu và node biến khỏi cây.
                if (err) console.warn('[userIdentifiedObject] don dong trung that bai:', err.message || err)
                else if (this && this.changes > 0) {
                    console.warn(`[userIdentifiedObject] da don ${this.changes} dong quyen so huu trung cho`,
                        row.identified_object_id)
                }
                resolve()
            }
        )
    })
}

// Thêm mới UserIdentifiedObject
export const insertUserIdentifiedObject = async (userIdentifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO user_identified_object(
                mrid,
                user_id,
                identified_object_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                user_id = excluded.user_id,
                identified_object_id = excluded.identified_object_id`,
            [
                userIdentifiedObject.mrid,
                userIdentifiedObject.user_id,
                userIdentifiedObject.identified_object_id
            ],
            function (err) {
                // Kèm thông báo thật của SQLite. Bản trước chỉ trả câu chung chung nên
                // "Insert userIdentifiedObject failed" không nói được là vi phạm khoá
                // ngoại nào — phải đọc log rồi suy ra, mất một vòng.
                if (err) return reject({
                    success: false, err,
                    message: `Insert userIdentifiedObject failed: ${err.message || err}`
                })
                // Dọn dòng trùng CẶP (khác mrid) — xem giải thích ở dedupeOwnership.
                dedupeOwnership(db, userIdentifiedObject).then(() =>
                    resolve({ success: true, data: userIdentifiedObject, message: 'Insert userIdentifiedObject completed' }))
            }
        )
    })
}

export const insertUserIdentifiedObjectTransaction = async (userIdentifiedObject, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO user_identified_object(
                mrid,
                user_id,
                identified_object_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                user_id = excluded.user_id,
                identified_object_id = excluded.identified_object_id`,
            [
                userIdentifiedObject.mrid,
                userIdentifiedObject.user_id,
                userIdentifiedObject.identified_object_id
            ],
            function (err) {
                // Kèm thông báo thật của SQLite. Bản trước chỉ trả câu chung chung nên
                // "Insert userIdentifiedObject failed" không nói được là vi phạm khoá
                // ngoại nào — phải đọc log rồi suy ra, mất một vòng.
                if (err) return reject({
                    success: false, err,
                    message: `Insert userIdentifiedObject failed: ${err.message || err}`
                })
                // Dọn dòng trùng CẶP (khác mrid) — xem giải thích ở dedupeOwnership.
                dedupeOwnership(dbsql, userIdentifiedObject).then(() =>
                    resolve({ success: true, data: userIdentifiedObject, message: 'Insert userIdentifiedObject completed' }))
            }
        )
    })
}

// Lấy UserIdentifiedObject theo mrid
export const getUserIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user_identified_object WHERE mrid = ?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get userIdentifiedObject failed' })
            if (!row) return resolve({ success: false, data: null, message: 'UserIdentifiedObject not found' })
            return resolve({ success: true, data: row, message: 'Get userIdentifiedObject completed' })
        })
    })
}

export const getUserIdentifiedObjectByUserId = async (user_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user_identified_object WHERE user_id = ?", [user_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get userIdentifiedObject failed' })
            if (!row) return resolve({ success: false, data: null, message: 'UserIdentifiedObject not found' })
            return resolve({ success: true, data: row, message: 'Get userIdentifiedObject completed' })
        })
    })
}

export const getIdentifiedObjectIdsByUserId = async (userId) => {
    return new Promise((resolve, reject) => {
        db.all(
            "SELECT identified_object_id FROM user_identified_object WHERE user_id = ?",
            [userId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get identified objects by user_id failed' })
                return resolve({
                    success: true,
                    data: (rows || []).map((row) => row.identified_object_id).filter(Boolean)
                })
            }
        )
    })
}


export const getUserIdentifiedObjectByIdentifiedObjectId = async (identified_object_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user_identified_object WHERE identified_object_id = ?", [identified_object_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get userIdentifiedObject failed' })
            if (!row) return resolve({ success: false, data: null, message: 'UserIdentifiedObject not found' })
            return resolve({ success: true, data: row, message: 'Get userIdentifiedObject completed' })
        })
    })
}

export const getUserIdentifiedObjectByUserIdAndIdentifiedObjectId = async (userId, identifiedObjectId) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user_identified_object WHERE user_id=? and identified_object_id=?", [userId, identifiedObjectId], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get user identified object by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'user identified object not found' })
            return resolve({ success: true, data: row, message: 'Get user identified object by id completed' })
        })
    })
}

// Cập nhật UserIdentifiedObject theo mrid
export const updateUserIdentifiedObjectById = async (mrid, userIdentifiedObject) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE user_identified_object SET
                user_id = ?,
                identified_object_id = ?
            WHERE mrid = ?`,
            [
                userIdentifiedObject.user_id,
                userIdentifiedObject.identified_object_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update userIdentifiedObject failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'UserIdentifiedObject not found' })
                return resolve({ success: true, data: userIdentifiedObject, message: 'Update userIdentifiedObject completed' })
            }
        )
    })
}

// Xóa UserIdentifiedObject theo mrid
export const deleteUserIdentifiedObjectById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM user_identified_object WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete userIdentifiedObject failed' })
            if (this.changes === 0) return resolve({ success: false, message: 'UserIdentifiedObject not found' })
            return resolve({ success: true, message: 'Delete userIdentifiedObject completed' })
        })
    })
}
