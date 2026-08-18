import db from '../../datacontext/index'

export const getZeroSequenceImpedanceTableById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM zero_sequence_impedance_table WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: "Get failed" })
                if (!row) return resolve({ success: false, data: null, message: "Not found" })
                return resolve({ success: true, data: row, message: "Completed" })
            }
        )
    })
}

export const getZeroSequenceImpedanceTableByTransformerEndId = async (transformerEndId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT *
             FROM zero_sequence_impedance_table
             WHERE transformer_end_id = ?`,
            [transformerEndId],
            (err, rows) => {
                if (err)
                    return reject({ success: false, err, message: "Get by transformer_end_id failed" })

                return resolve({
                    success: true,
                    data: rows,
                    message: "Completed"
                })
            }
        )
    })
}

export const getZeroSequenceImpedanceTableByZeroSequenceImpedanceId = async (zeroSequenceImpedanceId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT *
             FROM zero_sequence_impedance_table
             WHERE zero_sequence_impedance = ?`,
            [zeroSequenceImpedanceId],
            (err, rows) => {
                if (err)
                    return reject({ success: false, err, message: "Get by zero_sequence_impedance failed" })

                // KHÔNG reject khi danh sách rỗng.
                //
                // Bản trước `if (rows.length === 0) return reject(...)` — biến "không có
                // dòng nào" thành một ngoại lệ, và vì `err` lúc đó là null nên thông báo
                // đọc ra là `{ err: null, message: 'Get by zero_sequence_impedance failed' }`:
                // nói hỏng mà không nói hỏng cái gì. Ngoại lệ đó thoát ra ngoài và giết cả
                // `getTransformerEntityById`, nên máy biến áp không có bảng trở kháng thứ tự
                // không là không đọc được nữa.
                //
                // Với truy vấn DANH SÁCH, mảng rỗng LÀ câu trả lời đúng — không phải lỗi.
                // Đây là mặt ngược của lỗi vừa sửa ở `getZeroSequenceImpedanceByTransformerInfoId`:
                // ở đó "không có gì" bị báo là thành công, ở đây bị báo là hỏng. Cùng một
                // nhầm lẫn — lẫn giữa "không có dữ liệu" với một trạng thái khác.
                return resolve({
                    success: true,
                    data: rows || [],
                    message: "Completed"
                })
            }
        )
    })
}


export const insertZeroSequenceImpedanceTableTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO zero_sequence_impedance_table(
                mrid, transformer_end_id, zero, zero_sequence_impedance
            ) VALUES (?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                transformer_end_id = excluded.transformer_end_id,
                zero = excluded.zero,
                zero_sequence_impedance = excluded.zero_sequence_impedance`,
            [
                info.mrid,
                info.transformer_end_id,
                info.zero,
                info.zero_sequence_impedance
            ],
            function (err) {
                if (err)
                    return reject({ success: false, err, message: "Upsert failed" })
                return resolve({ success: true, data: info, message: "Upsert completed" })
            }
        )
    })
}


export const updateZeroSequenceImpedanceTableTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO zero_sequence_impedance_table(
                mrid, transformer_end_id, zero, zero_sequence_impedance
            ) VALUES (?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                transformer_end_id = excluded.transformer_end_id,
                zero = excluded.zero,
                zero_sequence_impedance = excluded.zero_sequence_impedance`,
            [
                mrid,
                info.transformer_end_id,
                info.zero,
                info.zero_sequence_impedance
            ],
            function (err) {
                if (err)
                    return reject({ success: false, err, message: "Upsert failed" })
                return resolve({ success: true, data: info, message: "Upsert completed" })
            }
        )
    })
}


export const deleteZeroSequenceImpedanceTableTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM zero_sequence_impedance_table WHERE mrid = ?`,
            [mrid],
            function (err) {
                if (err)
                    return reject({ success: false, err, message: "Delete failed" })
                return resolve({ success: true, data: mrid, message: "Delete completed" })
            }
        )
    })
}
