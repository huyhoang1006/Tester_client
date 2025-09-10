import db from '../../datacontext/index'

// Lấy testingEquipment theo mrid
export const getTestingEquipmentById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM testing_equipment WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get testingEquipment by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TestingEquipment not found' })
                return resolve({ success: true, data: row, message: 'Get testingEquipment by id completed' })
            }
        )
    })
}

export const getTestingEquipmentByWorkId = async (workId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM testing_equipment WHERE work_id=?`,
            [workId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get testingEquipment by workId failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'TestingEquipment not found' })
                return resolve({ success: true, data: rows, message: 'Get testingEquipment by workId completed' })
            }
        )
    })
}

// Thêm mới testingEquipment
export const insertTestingEquipmentTransaction = async (testingEquipment, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO testing_equipment(
                mrid, model, serial_number, work_id, calibration_date
            ) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                model = excluded.model,
                serial_number = excluded.serial_number,
                work_id = excluded.work_id,
                calibration_date = excluded.calibration_date
            `,
            [
                testingEquipment.mrid,
                testingEquipment.model,
                testingEquipment.serial_number,
                testingEquipment.work_id,
                testingEquipment.calibration_date
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert testingEquipment failed' })
                return resolve({ success: true, data: testingEquipment, message: 'Insert testingEquipment completed' })
            }
        )
    })
}

// Cập nhật testingEquipment
export const updateTestingEquipmentByIdTransaction = async (mrid, testingEquipment, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE testing_equipment SET
                model = ?,
                serial_number = ?,
                work_id = ?,
                calibration_date = ?
            WHERE mrid = ?`,
            [
                testingEquipment.model,
                testingEquipment.serial_number,
                testingEquipment.work_id,
                testingEquipment.calibration_date,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update testingEquipment failed' })
                return resolve({ success: true, data: testingEquipment, message: 'Update testingEquipment completed' })
            }
        )
    })
}

// Xóa testingEquipment
export const deleteTestingEquipmentByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM testing_equipment WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete testingEquipment failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'TestingEquipment not found' })
            return resolve({ success: true, data: null, message: 'Delete testingEquipment completed' })
        })
    })
}