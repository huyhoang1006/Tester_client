import db from '../../datacontext/index'
export const insertSheathVoltageLimiterTransaction = async (svl, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO sheath_voltage_limiter (
                    mrid,
                    rated_voltage_ur,
                    max_continuous_operating_voltage,
                    nominal_discharge_current,
                    high_current_impulse_withstand,
                    long_duration_current_impulse_withstand,
                    short_circuit_withstand,
                    cable_info_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                svl.mrid,
                svl.rated_voltage_ur,
                svl.max_continuous_operating_voltage,
                svl.nominal_discharge_current,
                svl.high_current_impulse_withstand,
                svl.long_duration_current_impulse_withstand,
                svl.short_circuit_withstand,
                svl.cable_info_id
            ],
            function (err) {
                if (err) {
                    return reject({ success: false, message: "Insert failed", err });
                }
                resolve({ success: true });
            }
        );
    });
};

export const getSheathVoltageLimiterByCableInfoId = async (cableInfoId) => {
    try {
        return new Promise((resolve, reject) => {
            db.get("SELECT * FROM sheath_voltage_limiter WHERE cable_info_id=?", [cableInfoId], (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get sheath voltage limiter by cable info id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'Sheath voltage limiter not found' })
                return resolve({ success: true, data: row, message: 'Get sheath voltage limiter by cable info id completed' })
            })
        })
    } catch (err) {
        return { success: false, err, message: 'Get sheath voltage limiter by cable info id failed' }
    }
}

export const getSheathVoltageLimiterById = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.get(
            "SELECT * FROM sheath_voltage_limiter WHERE mrid = ?",
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err });
                resolve({ success: true, data: row });
            }
        );
    });
};

export const updateSheathVoltageLimiterTransaction = async (svl, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.serialize(() => {
            dbsql.run("BEGIN TRANSACTION");
            dbsql.run(
                `UPDATE sheath_voltage_limiter SET
                    rated_voltage_ur = ?,
                    max_continuous_operating_voltage = ?,
                    nominal_discharge_current = ?,
                    high_current_impulse_withstand = ?,
                    long_duration_current_impulse_withstand = ?,
                    short_circuit_withstand = ?,
                    cable_info_id = ?
                 WHERE mrid = ?`,
                [
                    svl.rated_voltage_ur,
                    svl.max_continuous_operating_voltage,
                    svl.nominal_discharge_current,
                    svl.high_current_impulse_withstand,
                    svl.long_duration_current_impulse_withstand,
                    svl.short_circuit_withstand,
                    svl.cable_info_id,
                    svl.mrid
                ],
                function (err) {
                    if (err) {
                        dbsql.run("ROLLBACK");
                        return reject({ success: false, message: "Update failed", err });
                    }
                    dbsql.run("COMMIT");
                    resolve({ success: true });
                }
            );
        });
    });
};

export const deleteSheathVoltageLimiterTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            "DELETE FROM sheath_voltage_limiter WHERE mrid = ?",
            [mrid],
            function (err) {
                if (err) {
                    return reject({ success: false, message: "Delete failed", err });
                }
                resolve({ success: true });
            }
        );
    });
};
