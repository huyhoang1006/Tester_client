import db from '../../datacontext/index'

/**
 * Câu upsert dùng chung cho insertUser và insertUserTransaction.
 *
 * ─── VÌ SAO PHẢI COALESCE ────────────────────────────────────────────────────
 *
 * Bản trước ghi thẳng `role = excluded.role`, tức upsert KHÔNG phân biệt "không biết
 * giá trị" với "muốn xoá giá trị". Cả hai đều tới đây dưới dạng null, và cả hai đều
 * bị ghi thành null.
 *
 * Điều đó quan trọng vì HAI chỗ gọi hàm này đều chỉ muốn ĐẢM BẢO DÒNG TỒN TẠI để
 * user_identified_object có khoá ngoại trỏ vào — không chỗ nào muốn cập nhật tài khoản:
 *
 *   - substation: mapper chỉ gán user_id + username từ DTO; role/permission/token/
 *     group_user giữ null mặc định của lớp User.
 *   - testingEquipment: ghi chú ngay tại chỗ gọi là "đảm bảo user tồn tại (FK cho
 *     user_identified_object)".
 *
 * Nên mỗi lần lưu substation là một lần xoá trắng role, permission, username, token,
 * group_user của chính người đang đăng nhập. Import một file có 17 substation thì xoá
 * 17 lần. Không sập ngay vì chỉ getUserById đọc bảng này, nhưng nó phá đúng dòng mà cả
 * mô hình phân quyền dựa vào.
 *
 * COALESCE làm null mang nghĩa "giữ nguyên". Muốn xoá thật thì dùng updateUserById —
 * hàm đó ghi đè có chủ ý, và đó là chỗ đúng để làm việc đó.
 */
const UPSERT_USER_SQL = `
    INSERT INTO user(
        user_id,
        role,
        permission,
        username,
        token,
        group_user
    ) VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
        role       = COALESCE(excluded.role,       "user".role),
        permission = COALESCE(excluded.permission, "user".permission),
        username   = COALESCE(excluded.username,   "user".username),
        token      = COALESCE(excluded.token,      "user".token),
        group_user = COALESCE(excluded.group_user, "user".group_user)`

const upsertUserParams = (user) => [
    user.user_id,
    user.role,
    user.permission,
    user.username,
    user.token,
    user.group_user
]

// Thêm mới User
export const insertUser = async (user) => {
    return new Promise((resolve, reject) => {
        db.run(
            UPSERT_USER_SQL,
            upsertUserParams(user),
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
            UPSERT_USER_SQL,
            upsertUserParams(user),
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