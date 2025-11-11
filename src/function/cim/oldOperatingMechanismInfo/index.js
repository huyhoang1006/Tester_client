import db from '../../datacontext/index'
import * as OperatingMechanismInfoFunc from '../operatingMechanismInfo/index.js'

// ...existing code...
// Lấy oldOperatingMechanismInfo theo mrid
export const getOldOperatingMechanismInfoById = async (mrid) => {
    try {
        const parentRes = await OperatingMechanismInfoFunc.getOperatingMechanismInfoById(mrid)
        if (!parentRes.success) return { success: false, data: null, message: 'OperatingMechanismInfo not found' }

        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM old_operating_mechanism_info WHERE mrid = ?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get oldOperatingMechanismInfo by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'OldOperatingMechanismInfo not found' })
                    return resolve({ success: true, data: { ...parentRes.data, ...row }, message: 'Get oldOperatingMechanismInfo by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get oldOperatingMechanismInfo by id failed' }
    }
}

// Thêm mới oldOperatingMechanismInfo (transaction)
export const insertOldOperatingMechanismInfoTransaction = async (info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const parentRes = await OperatingMechanismInfoFunc.insertOperatingMechanismInfoTransaction(info, dbsql)
            if (!parentRes.success) return reject({ success: false, message: 'Insert OperatingMechanismInfo failed', err: parentRes.err })

            dbsql.run(
                `INSERT INTO old_operating_mechanism_info(
                    mrid,
                    rated_motor_current,
                    rated_motor_voltage,
                    motor_power_type,
                    rated_motor_frequency,
                    rated_auxiliary_circuit_current,
                    rated_auxiliary_circuit_voltage,
                    auxiliary_circuit_power_type,
                    rated_auxiliary_circuit_frequency,
                    rated_operating_pressure,
                    rated_operating_pressure_temperature
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    rated_motor_current = excluded.rated_motor_current,
                    rated_motor_voltage = excluded.rated_motor_voltage,
                    motor_power_type = excluded.motor_power_type,
                    rated_motor_frequency = excluded.rated_motor_frequency,
                    rated_auxiliary_circuit_current = excluded.rated_auxiliary_circuit_current,
                    rated_auxiliary_circuit_voltage = excluded.rated_auxiliary_circuit_voltage,
                    auxiliary_circuit_power_type = excluded.auxiliary_circuit_power_type,
                    rated_auxiliary_circuit_frequency = excluded.rated_auxiliary_circuit_frequency,
                    rated_operating_pressure = excluded.rated_operating_pressure,
                    rated_operating_pressure_temperature = excluded.rated_operating_pressure_temperature
                `,
                [
                    info.mrid,
                    info.rated_motor_current,
                    info.rated_motor_voltage,
                    info.motor_power_type,
                    info.rated_motor_frequency,
                    info.rated_auxiliary_circuit_current,
                    info.rated_auxiliary_circuit_voltage,
                    info.auxiliary_circuit_power_type,
                    info.rated_auxiliary_circuit_frequency,
                    info.rated_operating_pressure,
                    info.rated_operating_pressure_temperature
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert oldOperatingMechanismInfo failed' })
                    return resolve({ success: true, data: info, message: 'Insert oldOperatingMechanismInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert oldOperatingMechanismInfo transaction failed' })
        }
    })
}

// Cập nhật oldOperatingMechanismInfo (transaction)
export const updateOldOperatingMechanismInfoTransaction = async (mrid, info, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            const parentRes = await OperatingMechanismInfoFunc.updateOperatingMechanismInfoTransaction(mrid, info, dbsql)
            if (!parentRes.success) return reject({ success: false, message: 'Update OperatingMechanismInfo failed', err: parentRes.err })

            dbsql.run(
                `UPDATE old_operating_mechanism_info SET
                    rated_motor_current = ?,
                    rated_motor_voltage = ?,
                    motor_power_type = ?,
                    rated_motor_frequency = ?,
                    rated_auxiliary_circuit_current = ?,
                    rated_auxiliary_circuit_voltage = ?,
                    auxiliary_circuit_power_type = ?,
                    rated_auxiliary_circuit_frequency = ?,
                    rated_operating_pressure = ?,
                    rated_operating_pressure_temperature = ?
                WHERE mrid = ?`,
                [
                    info.rated_motor_current,
                    info.rated_motor_voltage,
                    info.motor_power_type,
                    info.rated_motor_frequency,
                    info.rated_auxiliary_circuit_current,
                    info.rated_auxiliary_circuit_voltage,
                    info.auxiliary_circuit_power_type,
                    info.rated_auxiliary_circuit_frequency,
                    info.rated_operating_pressure,
                    info.rated_operating_pressure_temperature,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update oldOperatingMechanismInfo failed' })
                    return resolve({ success: true, data: info, message: 'Update oldOperatingMechanismInfo completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update oldOperatingMechanismInfo transaction failed' })
        }
    })
}

// Xóa oldOperatingMechanismInfo (transaction)
export const deleteOldOperatingMechanismInfoTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM old_operating_mechanism_info WHERE mrid = ?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete oldOperatingMechanismInfo failed' })

                // then delete parent OperatingMechanismInfo
                OperatingMechanismInfoFunc.deleteOperatingMechanismInfoTransaction(mrid, dbsql)
                    .then(res => {
                        if (!res.success) return reject({ success: false, message: 'Delete OperatingMechanismInfo failed', err: res.err })
                        return resolve({ success: true, data: mrid, message: 'Delete oldOperatingMechanismInfo completed' })
                    })
                    .catch(err2 => reject({ success: false, err: err2, message: 'Delete OperatingMechanismInfo transaction failed' }))
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete oldOperatingMechanismInfo transaction failed' })
        }
    })
}
// ...existing code...