import db from '../../datacontext/index'

export const getVolumeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM volume WHERE mrid=?", [mrid], (err, row) => {
            if (err) return reject({ success: false, err: err, message: 'Get volume by id failed' })
            if (!row) return resolve({ success: false, data: null, message: 'Volume not found' })
            return resolve({ success: true, data: row, message: 'Get volume by id completed' })
        })
    })
}

export const insertVolume = async (volume) => {
    return new Promise((resolve, reject) => {
        db.run(
            `INSERT INTO volume(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                volume.mrid,
                volume.multiplier,
                volume.unit,
                volume.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert volume failed' })
                return resolve({ success: true, data: volume, message: 'Insert volume completed' })
            }
        )
    })
}

export const insertVolumeTransaction = async (volume, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO volume(mrid, multiplier, unit, value)
             VALUES (?, ?, ?, ?)
             ON CONFLICT(mrid) DO UPDATE SET
                multiplier = excluded.multiplier,
                unit = excluded.unit,
                value = excluded.value`,
            [
                volume.mrid,
                volume.multiplier,
                volume.unit,
                volume.value
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert volume failed' })
                return resolve({ success: true, data: volume, message: 'Insert volume completed' })
            }
        )
    })
}

export const updateVolumeById = async (mrid, volume) => {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE volume
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [volume.multiplier, volume.unit, volume.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update volume failed' })
                return resolve({ success: true, data: volume, message: 'Update volume completed' })
            }
        )
    })
}

export const updateVolumeByIdTransaction = async (mrid, volume, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE volume
             SET multiplier = ?, unit = ?, value = ?
             WHERE mrid = ?`,
            [volume.multiplier, volume.unit, volume.value, mrid],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update volume failed' })
                return resolve({ success: true, data: volume, message: 'Update volume completed' })
            }
        )
    })
}

export const deleteVolumeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.run("DELETE FROM volume WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete volume failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Volume not found' })
            return resolve({ success: true, data: null, message: 'Delete volume completed' })
        })
    })
}

export const deleteVolumeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM volume WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete volume failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'Volume not found' })
            return resolve({ success: true, data: null, message: 'Delete volume completed' })
        })
    })
}