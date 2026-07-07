import db from '../../datacontext/index'

// Lấy danh sách phụ kiện (accessory) của một máy chính
export const getAccessoriesByEquipmentId = async (equipmentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT *
            FROM accessory_testing_equipment
            WHERE equipment=?`,
            [equipmentId],
            (err, rows) => {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Get accessories by equipment failed'
                })

                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'Accessory not found'
                    })
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get accessories by equipment completed'
                })
            }
        )
    })
}

// Lấy CHI TIẾT phụ kiện của 1 máy (join asset + product_asset_model) để dựng lại tab Accessories
export const getAccessoryDetailsByEquipmentId = async (equipmentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT te.mrid AS mrid,
                    io.name AS name,
                    io.description AS description,
                    a.serial_number AS serial_no,
                    a.product_asset_model AS product_asset_model,
                    pam.model_number AS model
             FROM accessory_testing_equipment x
             JOIN testing_equipment te ON te.mrid = x.accessory
             JOIN asset a ON a.mrid = te.mrid
             LEFT JOIN identified_object io ON io.mrid = te.mrid
             LEFT JOIN product_asset_model pam ON pam.mrid = a.product_asset_model
             WHERE x.equipment = ?`,
            [equipmentId],
            (err, rows) => {
                if (err) return reject({ success: false, err, message: 'Get accessory details failed' })
                return resolve({ success: true, data: rows || [], message: 'Get accessory details completed' })
            }
        )
    })
}

// Lấy các máy chính đang dùng chung một phụ kiện
export const getEquipmentsByAccessoryId = async (accessoryId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT *
            FROM accessory_testing_equipment
            WHERE accessory=?`,
            [accessoryId],
            (err, rows) => {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Get equipments by accessory failed'
                })

                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'Equipment not found'
                    })
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get equipments by accessory completed'
                })
            }
        )
    })
}

// Thêm quan hệ equipment - accessory
export const insertAccessoryTestingEquipmentTransaction = async (
    accessoryTestingEquipment,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO accessory_testing_equipment(
                equipment,
                accessory
            ) VALUES (?, ?)
            ON CONFLICT(equipment, accessory) DO NOTHING`,
            [
                accessoryTestingEquipment.equipment,
                accessoryTestingEquipment.accessory
            ],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Insert accessoryTestingEquipment failed'
                })

                return resolve({
                    success: true,
                    data: accessoryTestingEquipment,
                    message: 'Insert accessoryTestingEquipment completed'
                })
            }
        )
    })
}

// Xóa một quan hệ equipment - accessory
export const deleteAccessoryTestingEquipmentTransaction = async (
    equipmentId,
    accessoryId,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM accessory_testing_equipment
            WHERE equipment=?
            AND accessory=?`,
            [
                equipmentId,
                accessoryId
            ],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Delete accessoryTestingEquipment failed'
                })

                if (this.changes === 0) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'AccessoryTestingEquipment not found'
                    })
                }

                return resolve({
                    success: true,
                    data: null,
                    message: 'Delete accessoryTestingEquipment completed'
                })
            }
        )
    })
}

// Xóa tất cả phụ kiện của một máy chính
export const deleteAccessoryTestingEquipmentByEquipmentIdTransaction = async (
    equipmentId,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM accessory_testing_equipment
            WHERE equipment=?`,
            [equipmentId],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Delete accessoryTestingEquipment by equipment failed'
                })

                return resolve({
                    success: true,
                    data: null,
                    message: 'Delete accessoryTestingEquipment by equipment completed'
                })
            }
        )
    })
}

// Xóa tất cả quan hệ có chứa một phụ kiện (khi xóa hẳn phụ kiện đó)
export const deleteAccessoryTestingEquipmentByAccessoryIdTransaction = async (
    accessoryId,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM accessory_testing_equipment
            WHERE accessory=?`,
            [accessoryId],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Delete accessoryTestingEquipment by accessory failed'
                })

                return resolve({
                    success: true,
                    data: null,
                    message: 'Delete accessoryTestingEquipment by accessory completed'
                })
            }
        )
    })
}
