import db from '../../datacontext/index'

// Lấy bushingTestingEquipmentTestType theo mrid
export const getBushingTestingEquipmentTestTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM bushing_testing_equipment_test_type WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get bushingTestingEquipmentTestType by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'BushingTestingEquipmentTestType not found' })
                return resolve({ success: true, data: row, message: 'Get bushingTestingEquipmentTestType by id completed' })
            }
        )
    })
}

export const getBushingTestingEquipmentTestingEqId = async (testingEqId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM bushing_testing_equipment_test_type WHERE testing_equipment_id=?`,
            [testingEqId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get bushingTestingEquipmentTestType by id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'BushingTestingEquipmentTestType not found' })
                return resolve({ success: true, data: rows, message: 'Get bushingTestingEquipmentTestType by id completed' })
            }
        )
    })
}

// Thêm mới bushingTestingEquipmentTestType
export const insertBushingTestingEquipmentTestTypeTransaction = async (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO bushing_testing_equipment_test_type(
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
                if (err) return reject({ success: false, err, message: 'Insert bushingTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Insert bushingTestingEquipmentTestType completed' })
            }
        )
    })
}

// Cập nhật bushingTestingEquipmentTestType
export const updateBushingTestingEquipmentTestTypeByIdTransaction = async (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE bushing_testing_equipment_test_type SET
                testing_equipment_id = ?,
                test_type_id = ?
            WHERE mrid = ?`,
            [
                data.testing_equipment_id,
                data.test_type_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update bushingTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Update bushingTestingEquipmentTestType completed' })
            }
        )
    })
}

// Xóa bushingTestingEquipmentTestType
export const deleteBushingTestingEquipmentTestTypeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM bushing_testing_equipment_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete bushingTestingEquipmentTestType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'BushingTestingEquipmentTestType not found' })
            return resolve({ success: true, data: null, message: 'Delete bushingTestingEquipmentTestType completed' })
        })
    })
}