import db from '../../datacontext/index'
import * as identifiedObjectFunc from '../identifiedObject/index'

// Lấy testStandard theo mrid
export const getTestStandardById = async (mrid) => {
    try {
        const identifiedObject = await identifiedObjectFunc.getIdentifiedObjectById(mrid)
        if (!identifiedObject.success) {
            return { success: false, data: null, message: 'IdentifiedObject not found' }
        }
        return new Promise((resolve, reject) => {
            db.get(
                `SELECT * FROM test_standard WHERE mrid=?`,
                [mrid],
                (err, row) => {
                    if (err) return reject({ success: false, err, message: 'Get testStandard by id failed' })
                    if (!row) return resolve({ success: false, data: null, message: 'TestStandard not found' })
                    return resolve({ success: true, data: { ...identifiedObject.data, ...row }, message: 'Get testStandard by id completed' })
                }
            )
        })
    } catch (err) {
        return { success: false, err, message: 'Get testStandard by id failed' }
    }
}

// Thêm mới testStandard
export const insertTestStandardTransaction = async (testStandard, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Thêm identifiedObject trước
            const idObjResult = await identifiedObjectFunc.insertIdentifiedObjectTransaction(testStandard, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Insert identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `INSERT INTO test_standard(
                    mrid, test_method, test_standard_astm, test_standard_cigre, test_standard_din,
                    test_standard_doble, test_standard_epa, test_standard_iec, test_standard_ieee,
                    test_standard_iso, test_standard_laborelec, test_standard_tappi,
                    test_standard_ukministry_of_defence, test_standard_wep, test_variant
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(mrid) DO UPDATE SET
                    test_method = excluded.test_method,
                    test_standard_astm = excluded.test_standard_astm,
                    test_standard_cigre = excluded.test_standard_cigre,
                    test_standard_din = excluded.test_standard_din,
                    test_standard_doble = excluded.test_standard_doble,
                    test_standard_epa = excluded.test_standard_epa,
                    test_standard_iec = excluded.test_standard_iec,
                    test_standard_ieee = excluded.test_standard_ieee,
                    test_standard_iso = excluded.test_standard_iso,
                    test_standard_laborelec = excluded.test_standard_laborelec,
                    test_standard_tappi = excluded.test_standard_tappi,
                    test_standard_ukministry_of_defence = excluded.test_standard_ukministry_of_defence,
                    test_standard_wep = excluded.test_standard_wep,
                    test_variant = excluded.test_variant
                `,
                [
                    testStandard.mrid,
                    testStandard.test_method,
                    testStandard.test_standard_astm,
                    testStandard.test_standard_cigre,
                    testStandard.test_standard_din,
                    testStandard.test_standard_doble,
                    testStandard.test_standard_epa,
                    testStandard.test_standard_iec,
                    testStandard.test_standard_ieee,
                    testStandard.test_standard_iso,
                    testStandard.test_standard_laborelec,
                    testStandard.test_standard_tappi,
                    testStandard.test_standard_ukministry_of_defence,
                    testStandard.test_standard_wep,
                    testStandard.test_variant
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Insert testStandard failed' })
                    return resolve({ success: true, data: testStandard, message: 'Insert testStandard completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Insert testStandard failed' })
        }
    })
}

// Cập nhật testStandard
export const updateTestStandardByIdTransaction = async (mrid, testStandard, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Cập nhật identifiedObject trước
            const idObjResult = await identifiedObjectFunc.updateIdentifiedObjectByIdTransaction(mrid, testStandard, dbsql)
            if (!idObjResult.success) {
                return reject({ success: false, message: 'Update identifiedObject failed', err: idObjResult.err })
            }
            dbsql.run(
                `UPDATE test_standard SET
                    test_method = ?,
                    test_standard_astm = ?,
                    test_standard_cigre = ?,
                    test_standard_din = ?,
                    test_standard_doble = ?,
                    test_standard_epa = ?,
                    test_standard_iec = ?,
                    test_standard_ieee = ?,
                    test_standard_iso = ?,
                    test_standard_laborelec = ?,
                    test_standard_tappi = ?,
                    test_standard_ukministry_of_defence = ?,
                    test_standard_wep = ?,
                    test_variant = ?
                WHERE mrid = ?`,
                [
                    testStandard.test_method,
                    testStandard.test_standard_astm,
                    testStandard.test_standard_cigre,
                    testStandard.test_standard_din,
                    testStandard.test_standard_doble,
                    testStandard.test_standard_epa,
                    testStandard.test_standard_iec,
                    testStandard.test_standard_ieee,
                    testStandard.test_standard_iso,
                    testStandard.test_standard_laborelec,
                    testStandard.test_standard_tappi,
                    testStandard.test_standard_ukministry_of_defence,
                    testStandard.test_standard_wep,
                    testStandard.test_variant,
                    mrid
                ],
                function (err) {
                    if (err) return reject({ success: false, err, message: 'Update testStandard failed' })
                    return resolve({ success: true, data: testStandard, message: 'Update testStandard completed' })
                }
            )
        } catch (err) {
            return reject({ success: false, err, message: 'Update testStandard failed' })
        }
    })
}

// Xóa testStandard
export const deleteTestStandardByIdTransaction = async (mrid, dbsql) => {
    return new Promise(async (resolve, reject) => {
        try {
            dbsql.run("DELETE FROM test_standard WHERE mrid=?", [mrid], function (err) {
                if (err) return reject({ success: false, err, message: 'Delete testStandard failed' })
                if (this.changes === 0) return resolve({ success: false, data: null, message: 'TestStandard not found' })
                // Xóa identifiedObject sau khi xóa testStandard
                identifiedObjectFunc.deleteIdentifiedObjectByIdTransaction(mrid, dbsql)
                return resolve({ success: true, data: null, message: 'Delete testStandard completed' })
            })
        } catch (err) {
            return reject({ success: false, err, message: 'Delete testStandard failed' })
        }
    })
}