import db from '../../datacontext/index'

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
                if (err) return reject({ success: false, err, message: 'Insert userIdentifiedObject failed' })
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
                if (err) return reject({ success: false, err, message: 'Insert userIdentifiedObject failed' })
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