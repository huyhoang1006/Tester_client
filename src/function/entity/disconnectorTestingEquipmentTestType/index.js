import db from '../../datacontext/index'

// Lấy disconnectorTestingEquipmentTestType theo mrid
export const getDisconnectorTestingEquipmentTestTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM disconnector_testing_equipment_test_type WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get disconnectorTestingEquipmentTestType by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'DisconnectorTestingEquipmentTestType not found' })
                return resolve({ success: true, data: row, message: 'Get disconnectorTestingEquipmentTestType by id completed' })
            }
        )
    })
}

export const getDisconnectorTestingEquipmentTestingEqId = async (testingEqId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM disconnector_testing_equipment_test_type WHERE testing_equipment_id=?`,
            [testingEqId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get disconnectorTestingEquipmentTestType by id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'DisconnectorTestingEquipmentTestType not found' })
                return resolve({ success: true, data: rows, message: 'Get disconnectorTestingEquipmentTestType by id completed' })
            }
        )
    })
}

// Thêm mới disconnectorTestingEquipmentTestType
export const insertDisconnectorTestingEquipmentTestTypeTransaction = async (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO disconnector_testing_equipment_test_type(
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
                if (err) return reject({ success: false, err, message: 'Insert disconnectorTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Insert disconnectorTestingEquipmentTestType completed' })
            }
        )
    })
}

// Cập nhật disconnectorTestingEquipmentTestType
export const updateDisconnectorTestingEquipmentTestTypeByIdTransaction = async (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE disconnector_testing_equipment_test_type SET
                testing_equipment_id = ?,
                test_type_id = ?
            WHERE mrid = ?`,
            [
                data.testing_equipment_id,
                data.test_type_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update disconnectorTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Update disconnectorTestingEquipmentTestType completed' })
            }
        )
    })
}

// Xóa disconnectorTestingEquipmentTestType
export const deleteDisconnectorTestingEquipmentTestTypeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM disconnector_testing_equipment_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete disconnectorTestingEquipmentTestType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'DisconnectorTestingEquipmentTestType not found' })
            return resolve({ success: true, data: null, message: 'Delete disconnectorTestingEquipmentTestType completed' })
        })
    })
}