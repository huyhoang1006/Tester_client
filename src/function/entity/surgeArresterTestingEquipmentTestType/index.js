import db from '../../datacontext/index'

// Lấy surgeArresterTestingEquipmentTestType theo mrid
export const getSurgeArresterTestingEquipmentTestTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM surge_arrester_testing_equipment_test_type WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get surgeArresterTestingEquipmentTestType by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'SurgeArresterTestingEquipmentTestType not found' })
                return resolve({ success: true, data: row, message: 'Get surgeArresterTestingEquipmentTestType by id completed' })
            }
        )
    })
}

export const getSurgeArresterTestingEquipmentTestingEqId = async (testingEqId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM surge_arrester_testing_equipment_test_type WHERE testing_equipment_id=?`,
            [testingEqId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get surgeArresterTestingEquipmentTestType by id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'SurgeArresterTestingEquipmentTestType not found' })
                return resolve({ success: true, data: rows, message: 'Get surgeArresterTestingEquipmentTestType by id completed' })
            }
        )
    })
}

// Thêm mới surgeArresterTestingEquipmentTestType
export const insertSurgeArresterTestingEquipmentTestTypeTransaction = async (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO surge_arrester_testing_equipment_test_type(
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
                if (err) return reject({ success: false, err, message: 'Insert surgeArresterTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Insert surgeArresterTestingEquipmentTestType completed' })
            }
        )
    })
}

// Cập nhật surgeArresterTestingEquipmentTestType
export const updateSurgeArresterTestingEquipmentTestTypeByIdTransaction = async (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE surge_arrester_testing_equipment_test_type SET
                testing_equipment_id = ?,
                test_type_id = ?
            WHERE mrid = ?`,
            [
                data.testing_equipment_id,
                data.test_type_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update surgeArresterTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Update surgeArresterTestingEquipmentTestType completed' })
            }
        )
    })
}

// Xóa surgeArresterTestingEquipmentTestType
export const deleteSurgeArresterTestingEquipmentTestTypeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM surge_arrester_testing_equipment_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete surgeArresterTestingEquipmentTestType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'SurgeArresterTestingEquipmentTestType not found' })
            return resolve({ success: true, data: null, message: 'Delete surgeArresterTestingEquipmentTestType completed' })
        })
    })
}