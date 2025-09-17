import db from '../../datacontext/index'

// Lấy terminalCableInfo theo mrid
export const getTerminalCableInfoById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM terminal_cable_info WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get terminalCableInfo by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TerminalCableInfo not found' })
                return resolve({ success: true, data: row, message: 'Get terminalCableInfo by id completed' })
            }
        )
    })
}

// Thêm mới terminalCableInfo (transaction)
export const insertTerminalCableInfoTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO terminal_cable_info(
                mrid, rated_u, bil, bsl, type, connector_type, service_condition, cable_info_id, class
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                rated_u = excluded.rated_u,
                bil = excluded.bil,
                bsl = excluded.bsl,
                type = excluded.type,
                connector_type = excluded.connector_type,
                service_condition = excluded.service_condition,
                cable_info_id = excluded.cable_info_id,
                class = excluded.class
            `,
            [
                info.mrid,
                info.rated_u,
                info.bil,
                info.bsl,
                info.type,
                info.connector_type,
                info.service_condition,
                info.cable_info_id,
                info.class
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Insert terminalCableInfo failed' })
                }
                return resolve({ success: true, data: info, message: 'Insert terminalCableInfo completed' })
            }
        )
    })
}

// Cập nhật terminalCableInfo (transaction)
export const updateTerminalCableInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE terminal_cable_info SET
                rated_u = ?,
                bil = ?,
                bsl = ?,
                type = ?,
                connector_type = ?,
                service_condition = ?,
                cable_info_id = ?,
                class = ?
            WHERE mrid = ?`,
            [
                info.rated_u,
                info.bil,
                info.bsl,
                info.type,
                info.connector_type,
                info.service_condition,
                info.cable_info_id,
                info.class,
                mrid
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, err, message: 'Update terminalCableInfo failed' })
                }
                return resolve({ success: true, data: info, message: 'Update terminalCableInfo completed' })
            }
        )
    })
}

// Xóa terminalCableInfo (transaction)
export const deleteTerminalCableInfoTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM terminal_cable_info WHERE mrid=?", [mrid], function (err) {
            if (err) {
                return reject({ success: false, err, message: 'Delete terminalCableInfo failed' })
            }
            return resolve({ success: true, data: mrid, message: 'Delete terminalCableInfo completed' })
        })
    })
}