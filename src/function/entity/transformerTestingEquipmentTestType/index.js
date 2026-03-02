import db from '../../datacontext/index'

// Lấy transformerTestingEquipmentTestType theo mrid
export const getTransformerTestingEquipmentTestTypeById = async (mrid) => {
    return new Promise((resolve, reject) => {
        db.get(
            `SELECT * FROM transformer_testing_equipment_test_type WHERE mrid=?`,
            [mrid],
            (err, row) => {
                if (err) return reject({ success: false, err, message: 'Get transformerTestingEquipmentTestType by id failed' })
                if (!row) return resolve({ success: false, data: null, message: 'TransformerTestingEquipmentTestType not found' })
                return resolve({ success: true, data: row, message: 'Get transformerTestingEquipmentTestType by id completed' })
            }
        )
    })
}

export const getTransformerTestingEquipmentTestingEqId = async (testingEqId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT * FROM transformer_testing_equipment_test_type WHERE testing_equipment_id=?`,
            [testingEqId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get transformerTestingEquipmentTestType by id failed' })
                if (!rows || rows.length === 0) return resolve({ success: false, data: null, message: 'TransformerTestingEquipmentTestType not found' })
                return resolve({ success: true, data: rows, message: 'Get transformerTestingEquipmentTestType by id completed' })
            }
        )
    })
}

// Thêm mới transformerTestingEquipmentTestType
export const insertTransformerTestingEquipmentTestTypeTransaction = async (data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO transformer_testing_equipment_test_type(
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
                if (err) return reject({ success: false, err, message: 'Insert transformerTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Insert transformerTestingEquipmentTestType completed' })
            }
        )
    })
}

// Cập nhật transformerTestingEquipmentTestType
export const updateTransformerTestingEquipmentTestTypeByIdTransaction = async (mrid, data, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `UPDATE transformer_testing_equipment_test_type SET
                testing_equipment_id = ?,
                test_type_id = ?
            WHERE mrid = ?`,
            [
                data.testing_equipment_id,
                data.test_type_id,
                mrid
            ],
            function (err) {
                if (err) return reject({ success: false, err, message: 'Update transformerTestingEquipmentTestType failed' })
                return resolve({ success: true, data: data, message: 'Update transformerTestingEquipmentTestType completed' })
            }
        )
    })
}

// Xóa transformerTestingEquipmentTestType
export const deleteTransformerTestingEquipmentTestTypeByIdTransaction = async (mrid, dbsql) => {
    return new Promise((resolve, reject) => {
        dbsql.run("DELETE FROM transformer_testing_equipment_test_type WHERE mrid=?", [mrid], function (err) {
            if (err) return reject({ success: false, err, message: 'Delete transformerTestingEquipmentTestType failed' })
            if (this.changes === 0) return resolve({ success: false, data: null, message: 'TransformerTestingEquipmentTestType not found' })
            return resolve({ success: true, data: null, message: 'Delete transformerTestingEquipmentTestType completed' })
        })
    })
}