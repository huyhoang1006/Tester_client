import db from '../../datacontext/index'

// Lấy reactorTestingEquipmentTestType theo mrid
export const getReactorTestingEquipmentTestTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM reactor_testing_equipment_test_type WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get reactorTestingEquipmentTestType by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'ReactorTestingEquipmentTestType not found' })
                return resolve({ success: true, data: row, message: 'Get reactorTestingEquipmentTestType by id completed' })
            }
        )
    })
}

export const getReactorTestingEquipmentTestingEqId = async (testingEqId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM reactor_testing_equipment_test_type WHERE testing_equipment_id=?`,
            [testingEqId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get reactorTestingEquipmentTestType by id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'ReactorTestingEquipmentTestType not found' })
                return resolve({ success: true, data: rows, message: 'Get reactorTestingEquipmentTestType by id completed' })
            }
        )
    })
}

// Thêm mới reactorTestingEquipmentTestType
export const insertReactorTestingEquipmentTestTypeTransaction = async (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO reactor_testing_equipment_test_type(
                mrid, testing_equipment_id, test_type_id
            ) VALUES (?, ?, ?)
            ON CONFLICT(mrid) DO UPDATE SET
                testing_equipment_id = excluded.testing_equipment_id,
                test_type_id = excluded.test_type_id
            `,
            [
                data.mrid,
                data.testing_equipment_id,
                data.test_type_id
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Insert reactorTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Insert reactorTestingEquipmentTestType completed' })
            }
        )
    })
}

// Cập nhật reactorTestingEquipmentTestType
export const updateReactorTestingEquipmentTestTypeByIdTransaction = async (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE reactor_testing_equipment_test_type SET
                testing_equipment_id = ?,
                test_type_id = ?
            WHERE mrid = ?`,
            [
                data.testing_equipment_id,
                data.test_type_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update reactorTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Update reactorTestingEquipmentTestType completed' })
            }
        )
    })
}

// Xóa reactorTestingEquipmentTestType
export const deleteReactorTestingEquipmentTestTypeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM reactor_testing_equipment_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete reactorTestingEquipmentTestType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'ReactorTestingEquipmentTestType not found' })
            return resolve({ success: true, data: null, message: 'Delete reactorTestingEquipmentTestType completed' })
        })
    })
}