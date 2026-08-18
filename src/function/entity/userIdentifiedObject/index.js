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
                return resolve({ success: true, data: userIdentifiedObject, message: 'Insert userIdentifiedObject completed' })
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
                return resolve({ success: true, data: userIdentifiedObject, message: 'Insert userIdentifiedObject completed' })
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
