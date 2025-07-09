import db from '../../datacontext/index'

// Thêm mới User
export const insertUser = async (user) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO user(
                user_id,
                role,
                permission,
                username,
                token,
                group_user
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                role = excluded.role,
                permission = excluded.permission,
                username = excluded.username,
                token = excluded.token,
                group_user = excluded.group_user`,
            [
                user.user_id,
                user.role,
                user.permission,
                user.username,
                user.token,
                user.group_user
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert user failed' })
                return resolve({ success: true, data: user, message: 'Insert user completed' })
            }
        )
    })
}

export const insertUserTransaction = async (user, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO user(
                user_id,
                role,
                permission,
                username,
                token,
                group_user
            ) VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                role = excluded.role,
                permission = excluded.permission,
                username = excluded.username,
                token = excluded.token,
                group_user = excluded.group_user`,
            [
                user.user_id,
                user.role,
                user.permission,
                user.username,
                user.token,
                user.group_user
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert user failed' })
                return resolve({ success: true, data: user, message: 'Insert user completed' })
            }
        )
    })
}

// Lấy User theo user_id
export const getUserById = async (user_id) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM user WHERE user_id = ?", [user_id], (err, row) => {
            if (err) return reject({ success: false, err, message: 'Get user failed' })
            if (!row) return resolve({ success: false, data: null, message: 'User not found' })
            return resolve({ success: true, data: row, message: 'Get user completed' })
        })
    })
}

// Cập nhật User theo user_id
export const updateUserById = async (user_id, user) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE user SET
                role = ?,
                permission = ?,
                username = ?,
                token = ?,
                group_user = ?
            WHERE user_id = ?`,
            [
                user.role,
                user.permission,
                user.username,
                user.token,
                user.group_user,
                user_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update user failed' })
                if (this.changes === 0) return resolve({ success: false, message: 'User not found' })
                return resolve({ success: true, data: user, message: 'Update user completed' })
            }
        )
    })
}

// Xóa User theo user_id
export const deleteUserById = async (user_id) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM user WHERE user_id = ?", [user_id], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete user failed' })
            if (this.changes === 0) return resolve({ success: false, message: 'User not found' })
            return resolve({ success: true, message: 'Delete user completed' })
        })
    })
}