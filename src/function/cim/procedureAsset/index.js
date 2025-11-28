import db from '../../datacontext/index'

// Lấy procedure asset theo mrid
export const getProcedureAssetById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM procedure_asset WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get procedure asset by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'procedure asset not found' })
                return resolve({ success: true, data: row, message: 'Get procedure asset by id completed' })
            }
        )
    })
}

// Thêm mới procedure asset (transaction)
export const insertProcedureAssetTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO procedure_asset(
                mrid, procedure_id, asset_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                procedure_id = excluded.procedure_id,
                asset_id = excluded.asset_id
            `,
            [
                info.mrid,
                info.procedure_id,
                info.asset_id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert ProcedureAsset failed' })
                }
                return resolve({ success: true, data: info, message: 'Insert ProcedureAsset completed' })
            }
        )
    })
}

// Cập nhật ProcedureAsset (transaction)
export const updateProcedureAssetTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE procedure_asset SET
                procedure_id = ?,
                asset_id = ?
            WHERE mrid = ?`,
            [
                info.procedure_id,
                info.asset_id,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update ProcedureAsset failed' })
                }
                return resolve({ success: true, data: info, message: 'Update ProcedureAsset completed' })
            }
        )
    })
}

// Xóa ProcedureAsset (transaction)
export const deleteProcedureAssetTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM procedure_asset WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete ProcedureAsset failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete ProcedureAsset completed' })
        })
    })
}