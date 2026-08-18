import db from '../../datacontext/index'

// Lấy thông tin lifecycle date theo mrid
export const getLifecycleDateById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM lifecycle_date WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get lifecycle date by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'LifecycleDate not found' })
            return resolve({ success: true, data: row, message: 'Get lifecycle date by id completed' })
        })
    })
}

// Thêm mới lifecycle date
export const insertLifecycleDate = async (data) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            db.run(
                `INSERT INTO lifecycle_date(
                    mrid, installation_date, manufactured_date, purchase_date,
                    received_date, removal_date, retired_date
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    installation_date = excluded.installation_date,
                    manufactured_date = excluded.manufactured_date,
                    purchase_date = excluded.purchase_date,
                    received_date = excluded.received_date,
                    removal_date = excluded.removal_date,
                    retired_date = excluded.retired_date
                `,
                [
                    data.mrid,
                    data.installation_date,
                    data.manufactured_date,
                    data.purchase_date,
                    data.received_date,
                    data.removal_date,
                    data.retired_date
                ],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK')
                        return reject({ success: false, err: err, message: 'Insert lifecycle date failed' })
                    }
                    db.run('COMMIT')
                    return resolve({ success: true, data: data, message: 'Insert lifecycle date completed' })
                }
            )
        })
    })
}

// Transaction: Thêm mới lifecycle date
/**
 * Ghi lifecycle_date trong một transaction.
 *
 * ─── VÌ SAO BỎ QUA KHI KHÔNG CÓ MRID ─────────────────────────────────────────
 *
 * `lifecycle_date.mrid` là NOT NULL. Gọi hàm này với `mrid` null thì SQLite ném
 * `SQLITE_CONSTRAINT: NOT NULL constraint failed: lifecycle_date.mrid`, và vì lời gọi
 * nằm giữa transaction của asset nên CẢ asset đó đổ — thông báo lên tới người dùng chỉ
 * còn hai chữ "fail".
 *
 * Mrid null ở đây là chuyện BÌNH THƯỜNG, không phải lỗi: mapper gán
 * `entity.lifecycleDate.mrid = dto.lifecycleDateId || null`, còn `_fillNullMrids` bên
 * import CỐ Ý không cấp mrid cho object rỗng — để khỏi tạo ra một bản ghi ngày tháng
 * trống trơn. Thiết bị không nhập ngày sản xuất nào thì đúng là không có gì để ghi.
 *
 * Nên "không có mrid" phải hiểu là "không có ngày để lưu", và bỏ qua là đúng. Cả 11 loại
 * asset đều gọi hàm này KHÔNG kiểm gì trước, nên chốt đặt ở đây vá được tất cả cùng lúc
 * thay vì rải 11 câu `if` giống nhau.
 *
 * Vẫn ghi log: bỏ qua thì được, nhưng bỏ qua im lặng thì không — nếu có ngày tháng thật
 * mà mrid bị mất ở đâu đó, dòng log này là thứ duy nhất chỉ ra.
 */
export const insertLifecycleDateTransaction = (data, dbsql) => {
    if (!data || !data.mrid) {
        const hasDates = data && ['installation_date', 'manufactured_date', 'purchase_date',
            'received_date', 'removal_date', 'retired_date']
            .some((k) => data[k] !== null && data[k] !== undefined && data[k] !== '')
        if (hasDates) {
            console.warn('[lifecycleDate] CO ngay thang nhung KHONG co mrid — bo qua, du lieu nay se mat:', data)
        }
        return Promise.resolve({ success: true, data: data, message: 'No lifecycle date to insert' })
    }
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO lifecycle_date(
                mrid, installation_date, manufactured_date, purchase_date,
                received_date, removal_date, retired_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                installation_date = excluded.installation_date,
                manufactured_date = excluded.manufactured_date,
                purchase_date = excluded.purchase_date,
                received_date = excluded.received_date,
                removal_date = excluded.removal_date,
                retired_date = excluded.retired_date
            `,
            [
                data.mrid,
                data.installation_date,
                data.manufactured_date,
                data.purchase_date,
                data.received_date,
                data.removal_date,
                data.retired_date
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Insert lifecycle date transaction failed' })
                }
                return resolve({ success: true, data: data, message: 'Insert lifecycle date transaction completed' })
            }
        )
    })
}

// Cập nhật lifecycle date
export const updateLifecycleDate = async (mrid, data) => {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            db.run(
                `UPDATE lifecycle_date SET
                    installation_date = ?,
                    manufactured_date = ?,
                    purchase_date = ?,
                    received_date = ?,
                    removal_date = ?,
                    retired_date = ?
                WHERE mrid = ?`,
                [
                    data.installation_date,
                    data.manufactured_date,
                    data.purchase_date,
                    data.received_date,
                    data.removal_date,
                    data.retired_date,
                    mrid
                ],
                function (err) {
                    if (err) {
                        db.run('ROLLBACK')
                        return reject({ success: false, err: err, message: 'Update lifecycle date failed' })
                    }
                    db.run('COMMIT')
                    return resolve({ success: true, data: data, message: 'Update lifecycle date completed' })
                }
            )
        })
    })
}

// Transaction: Cập nhật lifecycle date
export const updateLifecycleDateTransaction = (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE lifecycle_date SET
                installation_date = ?,
                manufactured_date = ?,
                purchase_date = ?,
                received_date = ?,
                removal_date = ?,
                retired_date = ?
            WHERE mrid = ?`,
            [
                data.installation_date,
                data.manufactured_date,
                data.purchase_date,
                data.received_date,
                data.removal_date,
                data.retired_date,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err: err, message: 'Update lifecycle date transaction failed' })
                }
                return resolve({ success: true, data: data, message: 'Update lifecycle date transaction completed' })
            }
        )
    })
}

// Xóa lifecycle date theo mrid
export const deleteLifecycleDateById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM lifecycle_date WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete lifecycle date failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete lifecycle date completed' })
        })
    })
}

export const deleteLifecycleDateByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM lifecycle_date WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err: err, message: 'Delete lifecycle date failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete lifecycle date completed' })
        })
    })
}