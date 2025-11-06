// Lấy operatingMechanismComponent theo mrid
export const getOperatingMechanismComponentById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM operating_mechanism_component WHERE mrid = ?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get operatingMechanismComponent by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'OperatingMechanismComponent not found' })
                return resolve({ success: true, data: row, message: 'Get operatingMechanismComponent by id completed' })
            }
        )
    })
}

// Lấy danh sách theo operating_mechanism_id
export const getOperatingMechanismComponentByOperatingMechanismId = async (operatingMechanismId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM operating_mechanism_component WHERE operating_mechanism_id = ?`,
            [operatingMechanismId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get operatingMechanismComponent by operating_mechanism_id failed' })
                return resolve({ success: true, data: rows, message: 'Get operatingMechanismComponent by operating_mechanism_id completed' })
            }
        )
    })
}

// Thêm mới operatingMechanismComponent (transaction)
export const insertOperatingMechanismComponentTransaction = async (info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO operating_mechanism_component(
                mrid, operating_mechanism_id, component, rated_current, rated_voltage, rated_frequency, power_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                operating_mechanism_id = excluded.operating_mechanism_id,
                component = excluded.component,
                rated_current = excluded.rated_current,
                rated_voltage = excluded.rated_voltage,
                rated_frequency = excluded.rated_frequency,
                power_type = excluded.power_type
            `,
            [
                info.mrid,
                info.operating_mechanism_id,
                info.component,
                info.rated_current,
                info.rated_voltage,
                info.rated_frequency,
                info.power_type
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert operatingMechanismComponent failed' })
                return resolve({ success: true, data: info, message: 'Insert operatingMechanismComponent completed' })
            }
        )
    })
}

// Cập nhật operatingMechanismComponent (transaction)
export const updateOperatingMechanismComponentTransaction = async (mrid, info, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE operating_mechanism_component SET
                operating_mechanism_id = ?,
                component = ?,
                rated_current = ?,
                rated_voltage = ?,
                rated_frequency = ?,
                power_type = ?
            WHERE mrid = ?`,
            [
                info.operating_mechanism_id,
                info.component,
                info.rated_current,
                info.rated_voltage,
                info.rated_frequency,
                info.power_type,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update operatingMechanismComponent failed' })
                return resolve({ success: true, data: info, message: 'Update operatingMechanismComponent completed' })
            }
        )
    })
}

// Xóa operatingMechanismComponent (transaction)
export const deleteOperatingMechanismComponentTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM operating_mechanism_component WHERE mrid = ?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete operatingMechanismComponent failed' })
            return resolve({ success: true, data: mrid, message: 'Delete operatingMechanismComponent completed' })
        })
    })
}