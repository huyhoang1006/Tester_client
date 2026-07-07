import db from '../../datacontext/index'

// Lấy testingEquipment theo softwareLicense
export const getTestingEquipmentBySoftwareLicenseId = async (softwareLicenseId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT *
            FROM software_license_testing_equipment
            WHERE software_license=?`,
            [softwareLicenseId],
            (err, rows) => {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Get testingEquipment by softwareLicense failed'
                })

                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'TestingEquipment not found'
                    })
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get testingEquipment by softwareLicense completed'
                })
            }
        )
    })
}

// Lấy softwareLicense theo testingEquipment
export const getSoftwareLicenseByTestingEquipmentId = async (testingEquipmentId) => {
    return new Promise((resolve, reject) => {
        db.all(
            `SELECT *
            FROM software_license_testing_equipment
            WHERE testing_equipment=?`,
            [testingEquipmentId],
            (err, rows) => {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Get softwareLicense by testingEquipment failed'
                })

                if (!rows || rows.length === 0) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'SoftwareLicense not found'
                    })
                }

                return resolve({
                    success: true,
                    data: rows,
                    message: 'Get softwareLicense by testingEquipment completed'
                })
            }
        )
    })
}

// Thêm quan hệ softwareLicense - testingEquipment
export const insertSoftwareLicenseTestingEquipmentTransaction = async (
    softwareLicenseTestingEquipment,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `INSERT INTO software_license_testing_equipment(
                software_license,
                testing_equipment
            ) VALUES (?, ?)
            ON CONFLICT(software_license, testing_equipment) DO NOTHING`,
            [
                softwareLicenseTestingEquipment.software_license,
                softwareLicenseTestingEquipment.testing_equipment
            ],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Insert softwareLicenseTestingEquipment failed'
                })

                return resolve({
                    success: true,
                    data: softwareLicenseTestingEquipment,
                    message: 'Insert softwareLicenseTestingEquipment completed'
                })
            }
        )
    })
}

// Xóa một quan hệ softwareLicense - testingEquipment
export const deleteSoftwareLicenseTestingEquipmentTransaction = async (
    softwareLicenseId,
    testingEquipmentId,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM software_license_testing_equipment
            WHERE software_license=?
            AND testing_equipment=?`,
            [
                softwareLicenseId,
                testingEquipmentId
            ],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Delete softwareLicenseTestingEquipment failed'
                })

                if (this.changes === 0) {
                    return resolve({
                        success: false,
                        data: null,
                        message: 'SoftwareLicenseTestingEquipment not found'
                    })
                }

                return resolve({
                    success: true,
                    data: null,
                    message: 'Delete softwareLicenseTestingEquipment completed'
                })
            }
        )
    })
}

// Xóa tất cả quan hệ theo softwareLicense
export const deleteSoftwareLicenseTestingEquipmentBySoftwareLicenseIdTransaction = async (
    softwareLicenseId,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM software_license_testing_equipment
            WHERE software_license=?`,
            [softwareLicenseId],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Delete softwareLicenseTestingEquipment by softwareLicense failed'
                })

                return resolve({
                    success: true,
                    data: null,
                    message: 'Delete softwareLicenseTestingEquipment by softwareLicense completed'
                })
            }
        )
    })
}

// Xóa tất cả quan hệ theo testingEquipment
export const deleteSoftwareLicenseTestingEquipmentByTestingEquipmentIdTransaction = async (
    testingEquipmentId,
    dbsql
) => {
    return new Promise((resolve, reject) => {
        dbsql.run(
            `DELETE FROM software_license_testing_equipment
            WHERE testing_equipment=?`,
            [testingEquipmentId],
            function (err) {
                if (err) return reject({
                    success: false,
                    err,
                    message: 'Delete softwareLicenseTestingEquipment by testingEquipment failed'
                })

                return resolve({
                    success: true,
                    data: null,
                    message: 'Delete softwareLicenseTestingEquipment by testingEquipment completed'
                })
            }
        )
    })
}